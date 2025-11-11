// src/functions/auth/login.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import { documentClient, GetCommand } from 'src/utils/dynamo';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Pega os nomes da tabela e o nosso SEGREDO do .yml
const USUARIOS_TABLE_NAME = process.env.USUARIOS_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

export const handler: APIGatewayProxyHandler = async (event) => {
  // --- CORREÇÃO ADICIONADA AQUI ---
  // Checa se a variável de ambiente foi carregada
  if (!JWT_SECRET) {
    console.error('ERRO DE CONFIGURAÇÃO: JWT_SECRET não está definido.');
    // Retornamos 500 pois é um erro do servidor
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro interno de configuração do servidor.',
      }),
    };
  }
  // --- FIM DA CORREÇÃO ---

  // 1. Validar e extrair dados do corpo (body)
  if (!event.body) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ message: 'Corpo da requisição ausente.' }),
    };
  }

  const { email, senha } = JSON.parse(event.body);

  if (!email || !senha) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Campos "email" e "senha" são obrigatórios.',
      }),
    };
  }

  try {
    // 2. Buscar o usuário pelo e-mail (nossa PK)
    const getParams = {
      TableName: USUARIOS_TABLE_NAME,
      Key: {
        email: email,
      },
    };

    const { Item: usuario } = await documentClient.send(
      new GetCommand(getParams)
    );

    // 3. Se o usuário não for encontrado, retorne 401
    if (!usuario) {
      return {
        statusCode: 401, // Unauthorized
        body: JSON.stringify({
          message: 'E-mail ou senha inválidos.', // Mensagem genérica por segurança
        }),
      };
    }

    // 4. Comparar a senha enviada com o hash salvo no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);

    // 5. Se a senha não bater, retorne 401
    if (!senhaCorreta) {
      return {
        statusCode: 401, // Unauthorized
        body: JSON.stringify({
          message: 'E-mail ou senha inválidos.',
        }),
      };
    }

    // 6. GERAR O TOKEN JWT
    // O usuário está autenticado! Vamos criar o token.
    const payload = {
      email: usuario.email,
      nome: usuario.nome,
    };

    // Agora o TypeScript sabe que JWT_SECRET é uma string
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h', // Token expira em 8 horas
    });

    // 7. Retornar sucesso com o token
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Login bem-sucedido.',
        token: token,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro interno ao realizar login.',
      }),
    };
  }
};