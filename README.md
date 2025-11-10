# 🎬 Streaming Movies CRUD API - AWS

API RESTful serverless para gerenciamento de catálogo de mídias (filmes e séries) construída com **AWS Lambda**, **API Gateway**, **DynamoDB** e **Serverless Framework**.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Deploy](#-deploy)
- [Testes](#-testes)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Segurança](#-segurança)

## 🎯 Visão Geral

Esta API serverless oferece um sistema completo de gerenciamento de catálogo de streaming, com autenticação JWT e operações CRUD completas para mídias. Desenvolvida seguindo as melhores práticas de arquitetura serverless e infraestrutura como código (IaC).

### Principais Características

- ✅ **Serverless**: Escalabilidade automática e pagamento por uso
- ✅ **Autenticação JWT**: Sistema seguro de autenticação e autorização
- ✅ **CRUD Completo**: Operações completas para gerenciamento de mídias
- ✅ **TypeScript**: Tipagem forte e melhor experiência de desenvolvimento
- ✅ **AWS DynamoDB**: Banco de dados NoSQL de alta performance
- ✅ **Infrastructure as Code**: Gerenciamento de infraestrutura via Serverless Framework

## 🏗️ Arquitetura

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   API Gateway       │
│   (REST API)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Lambda Authorizer  │ ◄── Valida JWT Token
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Lambda Functions   │
│  (Auth & CRUD)      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   DynamoDB Tables   │
│  - Usuarios         │
│  - Midias           │
└─────────────────────┘
```

## 🛠️ Tecnologias Utilizadas

### Backend & Cloud
- **Node.js 20.x** - Runtime JavaScript
- **TypeScript** - Superset JavaScript com tipagem estática
- **AWS Lambda** - Computação serverless
- **AWS API Gateway** - Gerenciamento de APIs REST
- **AWS DynamoDB** - Banco de dados NoSQL
- **AWS Systems Manager (SSM)** - Gerenciamento de secrets
- **Serverless Framework v4** - Deployment e IaC

### Bibliotecas Principais
- `@aws-sdk/client-dynamodb` - SDK AWS para DynamoDB
- `@aws-sdk/lib-dynamodb` - Document Client para DynamoDB
- `jsonwebtoken` - Geração e validação de tokens JWT
- `bcryptjs` - Hash de senhas
- `uuid` - Geração de IDs únicos

## ✨ Funcionalidades

### Autenticação
- ✅ Registro de usuários com hash de senha (bcrypt)
- ✅ Login com geração de token JWT
- ✅ Autorização via Lambda Authorizer
- ✅ Proteção de rotas sensíveis

### Gerenciamento de Mídias
- ✅ **Criar** nova mídia (filme ou série)
- ✅ **Listar** todas as mídias do catálogo
- ✅ **Buscar** mídia específica por ID
- ✅ **Atualizar** informações de uma mídia
- ✅ **Deletar** mídia do catálogo

### Campos de Mídia
- `mediaId` - ID único (UUID)
- `titulo` - Título da mídia
- `descricao` - Descrição detalhada
- `tipo` - FILME ou SERIE
- `anoLancamento` - Ano de lançamento
- `genero` - Gênero (ação, drama, comédia, etc.)
- `urlThumbnail` - URL da imagem (opcional)

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) v20.x ou superior
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [AWS CLI](https://aws.amazon.com/cli/) configurado
- [Serverless Framework](https://www.serverless.com/) v4
- Conta AWS ativa

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Bruno441/streaming-movies-crud-api-aws.git
cd streaming-movies-crud-api-aws/streaming-apis
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as credenciais AWS**
```bash
aws configure
```

## ⚙️ Configuração

### 1. Configurar JWT Secret no AWS Systems Manager

```bash
aws ssm put-parameter \
  --name "/streaming-api/dev/jwt-secret" \
  --value "seu-secret-super-seguro-aqui" \
  --type "SecureString" \
  --region us-east-1
```

### 2. Atualizar Região (Opcional)

Edite o arquivo `serverless.yml` para alterar a região:

```yaml
provider:
  region: us-east-1  # Altere para sua região preferida
```

## 📁 Estrutura do Projeto

```
streaming-apis/
├── src/
│   ├── functions/
│   │   ├── auth/
│   │   │   ├── authorizer.ts    # Lambda Authorizer (valida JWT)
│   │   │   ├── login.ts         # Endpoint de login
│   │   │   └── register.ts      # Endpoint de registro
│   │   └── media/
│   │       ├── create.ts        # Criar mídia
│   │       ├── delete.ts        # Deletar mídia
│   │       ├── get.ts           # Buscar mídia por ID
│   │       ├── list.ts          # Listar todas as mídias
│   │       └── update.ts        # Atualizar mídia
│   ├── utils/
│   │   └── dynamo.ts            # Utilitários DynamoDB
│   └── index.ts
├── serverless.yml               # Configuração Serverless Framework
├── tsconfig.json                # Configuração TypeScript
├── package.json                 # Dependências do projeto
└── README.md                    # Este arquivo
```

## 🌐 Endpoints da API

### Autenticação (Públicos)

#### Registrar Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "nome": "Nome do Usuário",
  "senha": "senha123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Gerenciamento de Mídias (Protegidos - Requer Token)

> 💡 **Nota:** Todos os endpoints abaixo requerem o header `Authorization: Bearer <token>`

#### Criar Mídia
```http
POST /media
Authorization: Bearer <seu-token-jwt>
Content-Type: application/json

{
  "titulo": "Matrix",
  "descricao": "Um hacker descobre a verdade sobre a realidade",
  "tipo": "FILME",
  "anoLancamento": 1999,
  "genero": "Ficção Científica",
  "urlThumbnail": "https://example.com/matrix.jpg"
}
```

#### Listar Todas as Mídias
```http
GET /media
Authorization: Bearer <seu-token-jwt>
```

#### Buscar Mídia por ID
```http
GET /media/{mediaId}
Authorization: Bearer <seu-token-jwt>
```

#### Atualizar Mídia
```http
PUT /media/{mediaId}
Authorization: Bearer <seu-token-jwt>
Content-Type: application/json

{
  "titulo": "Matrix Reloaded",
  "anoLancamento": 2003
}
```

#### Deletar Mídia
```http
DELETE /media/{mediaId}
Authorization: Bearer <seu-token-jwt>
```

## 🚢 Deploy

### Deploy Completo (Infraestrutura + Código)

```bash
# Fazer deploy em ambiente de desenvolvimento
serverless deploy

# Deploy em produção
serverless deploy --stage prod
```

### Deploy Apenas de Funções (Mais Rápido)

```bash
# Atualizar apenas o código das funções
serverless deploy function -f createMedia
serverless deploy function -f listMedia
```

### Remover Stack Completo

```bash
serverless remove
```

## 🧪 Testes

### Testar Localmente com Serverless Offline

```bash
npm install -D serverless-offline
serverless offline
```

### Testar Endpoint com cURL

```bash
# Registrar usuário
curl -X POST https://sua-api.execute-api.us-east-1.amazonaws.com/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","nome":"Test User","senha":"senha123"}'

# Login
curl -X POST https://sua-api.execute-api.us-east-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","senha":"senha123"}'

# Criar mídia (use o token retornado no login)
curl -X POST https://sua-api.execute-api.us-east-1.amazonaws.com/dev/media \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Matrix","descricao":"Filme","tipo":"FILME","anoLancamento":1999,"genero":"Sci-Fi"}'
```

## 🔐 Variáveis de Ambiente

As seguintes variáveis de ambiente são configuradas automaticamente pelo Serverless Framework:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `MIDIAS_TABLE_NAME` | Nome da tabela DynamoDB de mídias | `streaming-api-dev-midias` |
| `USUARIOS_TABLE_NAME` | Nome da tabela DynamoDB de usuários | `streaming-api-dev-usuarios` |
| `JWT_SECRET` | Secret para assinar tokens JWT | (armazenado no SSM) |

## 🔒 Segurança

### Práticas Implementadas

- ✅ **Hash de Senhas**: Uso de bcrypt com salt rounds
- ✅ **JWT Tokens**: Autenticação stateless
- ✅ **Lambda Authorizer**: Validação de tokens em nível de API Gateway
- ✅ **IAM Roles**: Princípio do menor privilégio
- ✅ **Secrets Manager**: JWT secret armazenado no AWS SSM
- ✅ **CORS**: Configuração de CORS adequada

### Recomendações Adicionais

- 🔐 Use HTTPS sempre (API Gateway fornece por padrão)
- 🔐 Implemente rate limiting no API Gateway
- 🔐 Adicione validação de entrada com bibliotecas como Joi ou Zod
- 🔐 Configure AWS WAF para proteção adicional
- 🔐 Habilite logging e monitoring com CloudWatch

## 📊 Monitoramento

### Visualizar Logs

```bash
# Logs de uma função específica
serverless logs -f createMedia -t

# Logs de todas as funções
serverless logs -f createMedia --startTime 1h
```

### CloudWatch

Acesse o [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/) para:
- Visualizar métricas de performance
- Configurar alarmes
- Analisar logs detalhados

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Bruno**

- GitHub: [@Bruno441](https://github.com/Bruno441)

## 📞 Suporte

Se você tiver alguma dúvida ou problema, por favor:

1. Verifique a [documentação do Serverless Framework](https://www.serverless.com/framework/docs/)
2. Consulte a [documentação da AWS](https://docs.aws.amazon.com/)
3. Abra uma [issue](https://github.com/Bruno441/streaming-movies-crud-api-aws/issues)

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!
