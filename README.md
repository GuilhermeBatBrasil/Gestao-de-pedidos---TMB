# Sistema de Gestão de Pedidos

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Azure](https://img.shields.io/badge/Azure-Service%20Bus-0078D4?logo=microsoft-azure)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

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
- [Monitoramento](#monitoramento)
- [Troubleshooting](#troubleshooting)
- [Documentação Adicional](#documentação-adicional)

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

- [Docker](https://www.docker.com/get-started) (versão 20.10 ou superior) e Docker Compose (versão 2.0 ou superior)
- [Conta Azure](https://azure.microsoft.com/free/) (gratuita com $200 de créditos para novos usuários)
- Git
- 4GB de RAM disponível (mínimo recomendado)
- Portas disponíveis: 3000, 5000, 5432, 5050

## Instalação e Execução

### 1. Clone o Repositório

```bash
git clone https://github.com/GuilhermeBatBrasil/Gestao-de-pedidos---TMB.git
cd Gestao-de-pedidos---TMB
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
nano .env  # ou use seu editor preferido (vim, code, etc.)
```

Exemplo de `.env`:
```bash
AZURE_SERVICEBUS_CONNECTION_STRING=Endpoint=sb://sb-orders-dev.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=sua-chave-aqui
```

**Importante**: 
- O arquivo `.env` está no `.gitignore` e não será commitado
- Nunca compartilhe sua connection string publicamente
- Para produção, use Azure Key Vault ou similar

### 3. Inicie o Sistema

```bash
# Torne os scripts executáveis (apenas primeira vez)
chmod +x start.sh stop.sh

# Inicia todos os serviços (API, Worker, Frontend, PostgreSQL)
./start.sh
```

**Primeira execução**: Aguarde ~3-5 minutos para:
- Download das imagens Docker
- Build dos containers
- Criação automática do banco de dados
- Aplicação das migrations
- Inicialização de todos os serviços

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

### 6. Comandos Úteis

```bash
# Ver status dos containers
docker compose ps

# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f frontend

# Reconstruir um serviço após mudanças no código
docker compose up --build api

# Parar todos os containers
docker compose down

# Parar e remover volumes (limpa o banco de dados)
docker compose down -v

# Reiniciar um serviço específico
docker compose restart api
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

## Estrutura do Projeto

```
.
├── backend/
│   ├── OrderManagement.API/         # API REST
│   │   ├── Controllers/             # Endpoints REST
│   │   │   └── OrdersController.cs
│   │   ├── Data/                    # DbContext e Migrations
│   │   │   ├── OrderDbContext.cs
│   │   │   └── Migrations/
│   │   ├── Models/                  # Entidades e DTOs
│   │   │   ├── Order.cs
│   │   │   ├── OrderMessage.cs
│   │   │   └── CreateOrderRequest.cs
│   │   ├── Services/                # Service Bus Service
│   │   │   ├── IServiceBusService.cs
│   │   │   └── ServiceBusService.cs
│   │   ├── appsettings.json
│   │   ├── Dockerfile
│   │   └── Program.cs
│   │
│   └── OrderManagement.Worker/      # Worker Assíncrono
│       ├── Data/                    # DbContext
│       │   └── OrderDbContext.cs
│       ├── Models/                  # Entidades
│       │   ├── Order.cs
│       │   └── OrderMessage.cs
│       ├── OrderProcessorWorker.cs  # Lógica de processamento
│       ├── appsettings.json
│       ├── Dockerfile
│       └── Program.cs
│
├── frontend/                        # Aplicação React
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── Layout.tsx
│   │   │   └── OrderTable.tsx
│   │   ├── pages/                   # Páginas da aplicação
│   │   │   ├── CreateOrder.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   └── OrderList.tsx
│   │   ├── services/                # Integração com API
│   │   │   └── orderService.ts
│   │   ├── types/                   # TypeScript types
│   │   │   └── order.ts
│   │   └── utils/                   # Utilitários
│   │       └── formatters.ts
│   ├── public/                      # Assets estáticos
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                            # Documentação adicional
│   ├── API.md                       # Documentação da API
│   └── ARQUITETURA.md               # Documentação da arquitetura
│
├── logs/                            # Logs da aplicação (gitignored)
├── .env                             # Variáveis de ambiente (gitignored)
├── .env.example                     # Exemplo de variáveis de ambiente
├── .gitignore                       # Arquivos ignorados pelo Git
├── docker-compose.yml               # Orquestração dos serviços
├── start.sh                         # Script para iniciar
├── stop.sh                          # Script para parar
└── README.md                        # Este arquivo
```

## Funcionalidades

### Frontend
- Listagem de pedidos em tabela responsiva
- Criação de pedidos via formulário com validações
- Visualização de detalhes do pedido
- Auto-refresh a cada 5 segundos (lista) e 3 segundos (detalhes)
- Feedback visual de status com cores
- Formatação de valores monetários (pt-BR)
- Formatação de datas (pt-BR)

### Backend (API)
- 3 endpoints REST (POST, GET, GET by ID)
- Validação de dados de entrada
- Persistência no PostgreSQL
- Publicação de eventos no Azure Service Bus
- Health checks (Database + Service Bus)
- Migrations automáticas
- CORS configurado
- Swagger para documentação

### Backend (Worker)
- Processamento assíncrono de pedidos
- Consumo de mensagens do Azure Service Bus
- Idempotência (não processa a mesma mensagem duas vezes)
- Fluxo: Pendente → Processando → Finalizado
- Delay de 5 segundos (simulação de processamento)
- Auto-complete de mensagens
- Dead-letter para mensagens com erro
- Health checks

### Mensageria
- CorrelationId = OrderId (rastreabilidade)
- EventType = "OrderCreated"
- Serialização JSON
- Tratamento de erros

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

# Se persistir, reconstrua
docker compose up --build api
```

**Possíveis causas**:
- PostgreSQL ainda não está pronto (aguarde o health check)
- Connection string do Azure Service Bus inválida
- Porta 5000 já está em uso

### Worker não processa mensagens

```bash
# Verifique a connection string no .env
cat .env

# Verifique os logs do worker
docker compose logs worker

# Verifique se a fila existe no Azure Portal
```

**Possíveis causas**:
- Connection string incorreta no `.env`
- Fila não criada no Azure Service Bus
- Nome da fila diferente de "orders"
- Problema de conectividade com o Azure

### Frontend não carrega

```bash
# Verifique se a API está respondendo
curl http://localhost:5000/health

# Reconstrua o frontend
docker compose up --build frontend
```

**Possíveis causas**:
- API não está rodando
- Porta 3000 já está em uso
- Erro de build do React

### Banco de dados não persiste dados

```bash
# Verifique se o volume existe
docker volume ls | grep postgres

# Se precisar resetar o banco
docker compose down -v
docker compose up -d
```

### Erro "port is already allocated"

```bash
# Descubra qual processo está usando a porta
sudo lsof -i :5000  # ou :3000, :5432, :5050

# Pare o processo ou mude a porta no docker-compose.yml
```

## Autor

**Guilherme Brasil**
- GitHub: [@GuilhermeBatBrasil](https://github.com/GuilhermeBatBrasil)
- Email: guilhermebbrasill@gmail.com

