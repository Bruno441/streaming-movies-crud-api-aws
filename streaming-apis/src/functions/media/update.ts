// src/functions/media/update.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import { documentClient, UpdateCommand } from 'src/utils/dynamo';

// Pega o nome da tabela (string | undefined)
const MIDIAS_TABLE_NAME = process.env.MIDIAS_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
  // --- CORREÇÃO 1: Checar se a Tabela existe ---
  if (!MIDIAS_TABLE_NAME) {
    console.error('ERRO DE CONFIGURAÇÃO: MIDIAS_TABLE_NAME não está definido.');
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro interno de configuração do servidor.',
      }),
    };
  }
  // --- FIM DA CORREÇÃO 1 ---

  // 1. Obter o ID dos parâmetros da URL
  const mediaId = event.pathParameters?.id;

  // 2. Validar o corpo (body) da requisição
  if (!event.body) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ message: 'Corpo da requisição ausente.' }),
    };
  }

  if (!mediaId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'O "id" da mídia é obrigatório no path.',
      }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    // 3. Lógica para construir o Update dinâmico
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Nenhum campo enviado para atualizar.' }),
      };
    }

    const updateExpression = `SET ${keys
      .map((key) => `#${key} = :${key}`)
      .join(', ')}`;

    const expressionAttributeNames = keys.reduce((acc: Record<string, any>, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {});

    const expressionAttributeValues = keys.reduce((acc: Record<string, any>, key) => {
      acc[`:${key}`] = data[key];
      return acc;
    }, {});

    // 4. Preparar o comando 'Update'
    const updateParams = {
      // Agora o TS sabe que MIDIAS_TABLE_NAME é 'string'
      TableName: MIDIAS_TABLE_NAME,
      Key: {
        mediaId: mediaId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,

      // --- CORREÇÃO 2: Adicionar 'as const' ---
      // Diz ao TS que este é o valor literal 'ALL_NEW', e não o tipo 'string'
      ReturnValues: 'ALL_NEW' as const,
      // --- FIM DA CORREÇÃO 2 ---
    };

    // 5. Executar o comando
    const { Attributes } = await documentClient.send(
      new UpdateCommand(updateParams)
    );

    // 6. Retornar o item atualizado
    return {
      statusCode: 200,
      body: JSON.stringify(Attributes),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro interno ao atualizar mídia.',
      }),
    };
  }
};