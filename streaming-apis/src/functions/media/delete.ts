// src/functions/media/delete.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import { documentClient, DeleteCommand } from 'src/utils/dynamo';

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

    // 2. Preparar o comando 'Delete'
    const deleteParams = {
      TableName: MIDIAS_TABLE_NAME,
      Key: {
        mediaId: mediaId, // A Chave Primária do item a ser deletado
      },
    };

    // 3. Executar o comando
    await documentClient.send(new DeleteCommand(deleteParams));

    // 4. Retornar sucesso
    // Nota: O DynamoDB não retorna erro se o item não existir.
    // Ele simplesmente não faz nada. Isso é chamado de idempotência.
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Mídia deletada com sucesso.' }),
      // (Uma alternativa RESTful pura seria retornar 204 No Content com body vazio)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro interno ao deletar mídia.',
      }),
    };
  }
};