# Sistema de Gestão de Pedidos

Sistema completo de gestão de pedidos com arquitetura orientada a eventos, desenvolvido com .NET, React e Azure Service Bus.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Testes](#testes)

## Sobre o Projeto

Sistema de gestão de pedidos que implementa um fluxo completo de processamento assíncrono:
- **Frontend React** para criação e visualização de pedidos
- **API REST** em .NET para gerenciamento
- **Azure Service Bus** para mensageria
- **Worker** dedicado para processamento assíncrono
- **PostgreSQL** como banco de dados

### Fluxo de Processamento

```
1. Usuário cria pedido (Frontend)
2. API salva no PostgreSQL (Status: Pendente)
3. API publica mensagem no Azure Service Bus
4. Worker consome mensagem da fila
5. Worker atualiza status para Processando
6. Worker processa pedido (5 segundos)
7. Worker finaliza (Status: Finalizado)
8. Frontend exibe atualizações em tempo real
```

## Arquitetura

```
┌─────────────┐         ┌──────────────┐         ┌──────────────────┐
│   Frontend  │────────▶│   API REST   │────────▶│   PostgreSQL     │
│   (React)   │         │   (.NET 8)   │         │                  │
└─────────────┘         └──────────────┘         └──────────────────┘
                               │
                               │ Publish
                               ▼
                        ┌──────────────────┐
                        │  Azure Service   │
                        │      Bus         │
                        └──────────────────┘
                               │
                               │ Subscribe
                               ▼
                        ┌──────────────┐         ┌──────────────────┐
                        │    Worker    │────────▶│   PostgreSQL     │
                        │   (.NET 8)   │         │                  │
                        └──────────────┘         └──────────────────┘
```

### Componentes

- **Frontend (React + TypeScript)**: Interface do usuário
- **API (.NET 8)**: Endpoints REST, validações e publicação de eventos
- **Worker (.NET 8)**: Processamento assíncrono de pedidos
- **Azure Service Bus**: Fila de mensagens para comunicação assíncrona
- **PostgreSQL**: Persistência de dados

## Tecnologias

### Backend
- **.NET 8.0** - Framework
- **Entity Framework Core** - ORM
- **PostgreSQL 16** - Banco de dados
- **Azure Service Bus** - Mensageria
- **Health Checks** - Monitoramento

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **TailwindCSS** - Framework CSS
- **Create React App** - Build tool

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **Nginx** - Web server (frontend)
- **PgAdmin** - Interface PostgreSQL

## Pré-requisitos

- [Docker](https://www.docker.com/get-started) e Docker Compose
- [Conta Azure](https://azure.microsoft.com/free/) (gratuita com $200 de créditos)
- Git

## Instalação e Execução

### 1. Clone o Repositório

```bash
git clone <seu-repositorio>
cd tmb
```

### 2. Configure o Azure Service Bus

#### 2.1. Crie o Service Bus no Azure

1. Acesse o [Portal Azure](https://portal.azure.com)
2. Crie um **Service Bus Namespace**:
   - Nome: `sb-orders-dev` (ou outro nome único)
   - Pricing tier: **Basic** (suficiente para desenvolvimento)
   - Region: **Brazil South** (ou mais próxima)
3. Crie uma **Queue** chamada `orders`
4. Obtenha a **Connection String**:
   - Vá em **Shared access policies**
   - Clique em **RootManageSharedAccessKey**
   - Copie a **Primary Connection String**

#### 2.2. Configure o Arquivo .env

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env e cole sua connection string
nano .env
```

Exemplo de `.env`:
```bash
AZURE_SERVICEBUS_CONNECTION_STRING=Endpoint=sb://sb-orders-dev.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=sua-chave-aqui
```

### 3. Inicie o Sistema

```bash
# Inicia todos os serviços (API, Worker, Frontend, PostgreSQL)
./start.sh
```

### 4. Acesse a Aplicação

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **PgAdmin**: http://localhost:5050 (admin@admin.com / admin)
- **Health Check**: http://localhost:5000/health

### 5. Para Parar

```bash
./stop.sh
```

## Endpoints da API

### Base URL
```
http://localhost:5000/api
```

### Criar Pedido
```http
POST /api/orders
Content-Type: application/json

{
  "cliente": "João Silva",
  "produto": "Notebook Dell",
  "valor": 3500.00
}
```

**Resposta**: `201 Created`
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "cliente": "João Silva",
  "produto": "Notebook Dell",
  "valor": 3500.00,
  "status": 0,
  "dataCriacao": "2024-12-01T10:00:00Z",
  "dataAtualizacao": null
}
```

### Listar Pedidos
```http
GET /api/orders
```

**Resposta**: `200 OK`
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "cliente": "João Silva",
    "produto": "Notebook Dell",
    "valor": 3500.00,
    "status": 2,
    "dataCriacao": "2024-12-01T10:00:00Z",
    "dataAtualizacao": "2024-12-01T10:00:10Z"
  }
]
```

### Buscar Pedido por ID
```http
GET /api/orders/{id}
```

**Resposta**: `200 OK` ou `404 Not Found`

### Status do Pedido

| Valor | Status | Descrição |
|-------|--------|-----------|
| 0 | Pendente | Pedido criado, aguardando processamento |
| 1 | Processando | Worker está processando o pedido |
| 2 | Finalizado | Pedido processado com sucesso |

## � Estrutura do Projeto

```
.
├── backend/
│   ├── OrderManagement.API/         # API REST
│   │   ├── Controllers/             # Endpoints
│   │   ├── Data/                    # DbContext e Migrations
│   │   ├── Models/                  # Entidades
│   │   ├── Services/                # Service Bus Service
│   │   └── Program.cs
│   │
│   └── OrderManagement.Worker/      # Worker Assíncrono
│       ├── Data/                    # DbContext
│       ├── Models/                  # Entidades
│       ├── OrderProcessorWorker.cs  # Lógica de processamento
│       └── Program.cs
│
├── frontend/                        # Aplicação React
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   ├── pages/                   # Páginas da aplicação
│   │   ├── services/                # Integração com API
│   │   ├── types/                   # TypeScript types
│   │   └── utils/                   # Utilitários
│   ├── Dockerfile
│   └── nginx.conf
│
├── docs/                            # Documentação adicional
├── docker-compose.yml               # Orquestração dos serviços
├── .env.example                     # Exemplo de variáveis de ambiente
├── start.sh                         # Script para iniciar
├── stop.sh                          # Script para parar
└── README.md                        # Este arquivo
```

## Funcionalidades

### Frontend
- ✅ Listagem de pedidos em tabela responsiva
- ✅ Criação de pedidos via formulário com validações
- ✅ Visualização de detalhes do pedido
- ✅ Auto-refresh a cada 5 segundos (lista) e 3 segundos (detalhes)
- ✅ Feedback visual de status com cores
- ✅ Formatação de valores monetários (pt-BR)
- ✅ Formatação de datas (pt-BR)

### Backend (API)
- ✅ 3 endpoints REST (POST, GET, GET by ID)
- ✅ Validação de dados de entrada
- ✅ Persistência no PostgreSQL
- ✅ Publicação de eventos no Azure Service Bus
- ✅ Health checks (Database + Service Bus)
- ✅ Migrations automáticas
- ✅ CORS configurado
- ✅ Swagger para documentação

### Backend (Worker)
- ✅ Processamento assíncrono de pedidos
- ✅ Consumo de mensagens do Azure Service Bus
- ✅ Idempotência (não processa a mesma mensagem duas vezes)
- ✅ Fluxo: Pendente → Processando → Finalizado
- ✅ Delay de 5 segundos (simulação de processamento)
- ✅ Auto-complete de mensagens
- ✅ Dead-letter para mensagens com erro
- ✅ Health checks

### Mensageria
- ✅ CorrelationId = OrderId (rastreabilidade)
- ✅ EventType = "OrderCreated"
- ✅ Serialização JSON
- ✅ Tratamento de erros

## Testes

### Teste Manual Completo

1. **Inicie o sistema**: `./start.sh`

2. **Acesse o frontend**: http://localhost:3000

3. **Crie um pedido**:
   - Clique em "Novo Pedido"
   - Preencha: Cliente, Produto, Valor
   - Clique em "Criar Pedido"

4. **Observe o fluxo**:
   - Pedido aparece na lista com status "Pendente"
   - Após ~2 segundos: status muda para "Processando" 
   - Após ~5 segundos: status muda para "Finalizado"

5. **Verifique os logs**:
   ```bash
   # API
   docker compose logs -f api
   
   # Worker
   docker compose logs -f worker
   ```

### Teste via cURL

```bash
# Criar pedido
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Maria Santos",
    "produto": "Mouse Gamer",
    "valor": 250.00
  }'

# Listar pedidos
curl http://localhost:5000/api/orders

# Buscar pedido específico
curl http://localhost:5000/api/orders/{id}
```

## � Monitoramento

### Logs em Tempo Real

```bash
# Todos os serviços
docker compose logs -f

# Apenas API
docker compose logs -f api

# Apenas Worker
docker compose logs -f worker

# Apenas Frontend
docker compose logs -f frontend
```

### Health Checks

- **API**: http://localhost:5000/health
- Verifica:
  - Conexão com PostgreSQL
  - Conexão com Azure Service Bus

### PgAdmin

Acesse http://localhost:5050 para visualizar o banco de dados:
- Email: `admin@admin.com`
- Password: `admin`

Para conectar ao PostgreSQL:
- Host: `postgres`
- Port: `5432`
- Database: `ordermanagement`
- Username: `postgres`
- Password: `postgres`

## Troubleshooting

### API não inicia

```bash
# Verifique os logs
docker compose logs api

# Verifique se o PostgreSQL está rodando
docker compose ps postgres

# Reinicie a API
docker compose restart api
```

### Worker não processa mensagens

```bash
# Verifique a connection string no .env
cat .env

# Verifique os logs do worker
docker compose logs worker

# Verifique se a fila existe no Azure Portal
```

### Frontend não carrega

```bash
# Verifique se a API está respondendo
curl http://localhost:5000/health

# Reconstrua o frontend
docker compose up --build frontend
```

## Documentação Adicional

- [Documentação da API](./docs/API.md)
- [Frontend](./frontend/README.md)

