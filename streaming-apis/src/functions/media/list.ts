// src/functions/media/list.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import { documentClient, ScanCommand } from 'src/utils/dynamo';

const MIDIAS_TABLE_NAME = process.env.MIDIAS_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // 1. O comando 'Scan' lê TODOS os itens da tabela.
    const scanParams = {
      TableName: MIDIAS_TABLE_NAME,
    };

    // 2. Executar o scan
    const data = await documentClient.send(new ScanCommand(scanParams));

    // 3. Retornar os itens encontrados (data.Items)
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items || []),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro interno ao listar mídias.',
      }),
    };
  }
};