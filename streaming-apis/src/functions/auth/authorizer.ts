// src/functions/auth/authorizer.ts

import {
  APIGatewayTokenAuthorizerHandler,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

// Pega o segredo (que pode ser undefined)
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Esta função gera a política de permissão que o API Gateway entende.
 * @param principalId - O identificador do usuário (ex: o e-mail)
 * @param effect - 'Allow' (Permitir) ou 'Deny' (Negar)
 * @param resource - O ARN (Amazon Resource Name) do endpoint que o usuário
 * está tentando acessar (ex: POST /media)
 */
const generatePolicy = (
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string
): APIGatewayAuthorizerResult => {
  // Extrai o ARN base e adiciona wildcard para autorizar TODAS as rotas
  // Exemplo: arn:aws:execute-api:us-east-1:123456789012:abcdef123/dev/GET/media
  // Vira: arn:aws:execute-api:us-east-1:123456789012:abcdef123/*/*
  const arnParts = resource.split('/');
  const apiGatewayArnBase = arnParts.slice(0, 2).join('/'); // Pega até o stage
  const resourceWildcard = `${apiGatewayArnBase}/*/*`; // Autoriza todos os métodos e paths
  
  return {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke', // Ação de invocar a API
          Effect: effect,
          Resource: resourceWildcard, // TODAS as rotas da API
        },
      ],
    },
  };
};

export const handler: APIGatewayTokenAuthorizerHandler = async (event) => {
  // --- CORREÇÃO ADICIONADA AQUI ---
  // Checa se a variável de ambiente foi carregada
  if (!JWT_SECRET) {
    console.error('ERRO DE CONFIGURAÇÃO: JWT_SECRET não está definido.');
    // Isso é um erro de servidor (500), não de autorização (401)
    throw new Error('Erro interno de configuração do servidor');
  }
  // --- FIM DA CORREÇÃO ---

  // 1. O token vem em 'event.authorizationToken'
  const token = event.authorizationToken;

  // 2. Se não houver token ou não começar com "Bearer ", negue.
  if (!token || !token.startsWith('Bearer ')) {
    console.error('Token ausente ou mal formatado');
    // Jogar um erro "Unauthorized" faz o API Gateway retornar 401
    throw new Error('Unauthorized');
  }

  try {
    // 3. Extrair o valor do token (removendo o "Bearer ")
    const tokenValue = token.split(' ')[1];

    // 4. Verificar o token (validade, assinatura, expiração)
    // Agora o TypeScript sabe que JWT_SECRET é uma string.
    const decoded = jwt.verify(tokenValue, JWT_SECRET);

    // 5. Se o 'verify' passou, o token é VÁLIDO!
    // Precisamos garantir que o payload decodificado tem o 'email'
    if (typeof decoded === 'string' || !decoded.email) {
      throw new Error('Token com payload inválido');
    }

    // 6. Token válido! Retorne uma política de "Allow" (Permitir)
    return generatePolicy(decoded.email, 'Allow', event.methodArn);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro na validação do token:', errorMessage);
    // 7. Se o 'verify' falhou (token expirado, assinatura errada), negue.
    throw new Error('Unauthorized');
  }
};