// src/functions/media/create.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import { documentClient, PutCommand } from 'src/utils/dynamo';
import { v4 as uuid } from 'uuid'; // Para gerar IDs únicos

// Pega o nome da tabela do .yml
const MIDIAS_TABLE_NAME = process.env.MIDIAS_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
  // 1. Validar o corpo (body) da requisição
  if (!event.body) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ message: 'Corpo da requisição ausente.' }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Validação simples dos campos obrigatórios
    if (
      !data.titulo ||
      !data.descricao ||
      !data.tipo ||
      !data.anoLancamento ||
      !data.genero
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            'Campos "titulo", "descricao", "tipo", "anoLancamento" e "genero" são obrigatórios.',
        }),
      };
    }

    // 2. Gerar um ID único para a nova mídia
    const mediaId = uuid();

    // 3. Montar o item que será salvo no DynamoDB
    const novaMidia = {
      mediaId: mediaId, // Nossa Chave Primária (PK)
      titulo: data.titulo,
      descricao: data.descricao,
      tipo: data.tipo, // 'FILME' ou 'SERIE'
      anoLancamento: data.anoLancamento,
      genero: data.genero,
      urlThumbnail: data.urlThumbnail || null, // Campo opcional
      createdAt: new Date().toISOString(),
    };

    // 4. Preparar o comando 'Put' para o DynamoDB
    const putParams = {
      TableName: MIDIAS_TABLE_NAME,
      Item: novaMidia,
    };

    // 5. Salvar no banco
    await documentClient.send(new PutCommand(putParams));

    // 6. Retornar sucesso
    return {
      statusCode: 201, // Created
      body: JSON.stringify(novaMidia),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro interno ao criar mídia.',
      }),
    };
  }
};