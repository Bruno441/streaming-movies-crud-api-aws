// src/functions/media/get.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import { documentClient, GetCommand } from 'src/utils/dynamo';

const MIDIAS_TABLE_NAME = process.env.MIDIAS_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // 1. Obter o ID dos parâmetros da URL
    const mediaId = event.pathParameters?.id;

    if (!mediaId) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({
          message: 'O "id" da mídia é obrigatório no path.',
        }),
      };
    }

    // 2. Preparar o comando 'Get'
    // 'Get' é o comando otimizado para buscar um item pela sua Chave Primária
    const getParams = {
      TableName: MIDIAS_TABLE_NAME,
      Key: {
        mediaId: mediaId, // A Chave Primária que definimos no .yml
      },
    };

    // 3. Executar o comando
    const { Item } = await documentClient.send(new GetCommand(getParams));

    // 4. Verificar se o item foi encontrado
    if (!Item) {
      return {
        statusCode: 404, // Not Found
        body: JSON.stringify({ message: 'Mídia não encontrada.' }),
      };
    }

    // 5. Retornar o item
    return {
      statusCode: 200,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro interno ao buscar mídia.',
      }),
    };
  }
};