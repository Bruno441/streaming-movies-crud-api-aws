// src/functions/auth/register.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  documentClient,
  PutCommand,
  GetCommand,
} from 'src/utils/dynamo';
import * as bcrypt from 'bcryptjs';

// Pega os nomes das tabelas das variáveis de ambiente
// que definimos no serverless.yml
const USUARIOS_TABLE_NAME = process.env.USUARIOS_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
  // 1. Validar e extrair dados do corpo (body) da requisição
  if (!event.body) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ message: 'Corpo da requisição ausente.' }),
    };
  }

  const { email, nome, senha } = JSON.parse(event.body);

  if (!email || !nome || !senha) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Campos "email", "nome" e "senha" são obrigatórios.',
      }),
    };
  }

  try {
    // 2. Verificar se o usuário (email) já existe
    const getParams = {
      TableName: USUARIOS_TABLE_NAME,
      Key: {
        email: email, // 'email' é nossa chave primária
      },
    };

    const { Item: usuarioExistente } = await documentClient.send(
      new GetCommand(getParams)
    );

    if (usuarioExistente) {
      return {
        statusCode: 409, // Conflict
        body: JSON.stringify({
          message: 'Um usuário com este e-mail já existe.',
        }),
      };
    }

    // 3. Hashear a senha (BOA PRÁTICA DE SEGURANÇA)
    // Nunca salve a senha pura!
    const senhaHash = await bcrypt.hash(senha, 10); // 10 é o "salt rounds"

    // 4. Criar o novo item de usuário
    const novoUsuario = {
      email: email,
      nome: nome,
      senhaHash: senhaHash,
      createdAt: new Date().toISOString(),
    };

    const putParams = {
      TableName: USUARIOS_TABLE_NAME,
      Item: novoUsuario,
    };

    // 5. Salvar no DynamoDB
    await documentClient.send(new PutCommand(putParams));

    // 6. Retornar sucesso
    // Não retorne a senhaHash no response!
    return {
      statusCode: 201, // Created
      body: JSON.stringify({
        message: 'Usuário registrado com sucesso.',
        usuario: {
          email: novoUsuario.email,
          nome: novoUsuario.nome,
        },
      }),
    };
  } catch (error) {
    console.error(error); // Log do erro para o CloudWatch (monitoramento)
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({
        message: 'Erro interno ao registrar usuário.',
      }),
    };
  }
};