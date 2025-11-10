// src/utils/dynamo.ts

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

/*
 * O que é isso?
 * 1. O 'DynamoDBClient' é o cliente "nu" da AWS.
 * 2. O 'DynamoDBDocumentClient' é um "tradutor" que nos permite
 * usar objetos JavaScript normais (ex: { id: 1, nome: "Bruno" })
 * em vez do formato verboso do DynamoDB (ex: { id: { N: "1" }, nome: { S: "Bruno" } }).
 * Isso torna nosso código IMENSAMENTE mais limpo.
 */

// Cria o cliente base do DynamoDB
const client = new DynamoDBClient({});

// Cria o DocumentClient (o "tradutor")
const documentClient = DynamoDBDocumentClient.from(client);

// Exporta o cliente e os comandos para usarmos em nossas funções
export {
  documentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
};