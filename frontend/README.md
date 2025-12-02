# Frontend - Order Management System

Sistema de gestão de pedidos desenvolvido com **Create React App** e **TypeScript**.

## Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **TailwindCSS** - Framework CSS
- **Create React App** - Tooling

## Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal com navegação
│   └── OrderTable.tsx  # Tabela de listagem de pedidos
│
├── pages/              # Páginas da aplicação
│   ├── OrderList.tsx   # Página de listagem
│   ├── CreateOrder.tsx # Página de criação
│   └── OrderDetail.tsx # Página de detalhes
│
├── services/           # Serviços de API
│   └── orderService.ts # Cliente da API de pedidos
│
├── types/              # Definições TypeScript
│   └── order.ts        # Tipos relacionados a pedidos
│
├── utils/              # Funções utilitárias
│   └── formatters.ts   # Formatadores (moeda, data, status)
│
├── App.tsx             # Componente raiz com rotas
└── index.tsx           # Entry point
```

## Como Executar

### Desenvolvimento Local

```bash
# Instalar dependências (se necessário)
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm start
```

A aplicação estará disponível em: http://localhost:3000

### Build para Produção

```bash
# Criar build otimizado
npm run build

# A pasta build/ conterá os arquivos estáticos
```

### Docker

```bash
# Build da imagem
docker build -t ordermanagement-frontend .

# Executar container
docker run -p 3000:80 ordermanagement-frontend
```

## Páginas

### 1. Lista de Pedidos (`/`)
- Exibe todos os pedidos em uma tabela
- Auto-refresh a cada 5 segundos
- Clique em um pedido para ver detalhes
- Botão para criar novo pedido

### 2. Criar Pedido (`/create`)
- Formulário com validações
- Campos: Cliente, Produto, Valor
- Redireciona para lista após criar

### 3. Detalhes do Pedido (`/orders/:id`)
- Mostra todas as informações do pedido
- Status visual com cores
- Auto-refresh a cada 3 segundos
- Botão para voltar à lista

## Componentes

### Layout
Componente wrapper com:
- Navegação superior
- Logo e título
- Links ativos destacados

### OrderTable
Tabela responsiva com:
- Headers descritivos
- Formatação de valores e datas
- Badge de status colorido
- Hover effects
- Click para detalhes

## Integração com API

### Configuração

Configure a URL da API no arquivo `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Service Layer

O `orderService.ts` abstrai todas as chamadas à API:

```typescript
// Listar todos os pedidos
const orders = await orderService.getOrders();

// Buscar pedido específico
const order = await orderService.getOrder(id);

// Criar novo pedido
const newOrder = await orderService.createOrder({
  cliente: "João Silva",
  produto: "Notebook",
  valor: 3500.00
});
```

## Estilos e UI

### TailwindCSS

O projeto usa Tailwind para estilização:
- Utility-first CSS
- Responsivo por padrão
- Tema consistente

### Cores por Status

- **Pendente**: Amarelo (`bg-yellow-100`)
- **Processando**: Azul (`bg-blue-100`)
- **Finalizado**: Verde (`bg-green-100`)

### Responsividade

- Mobile-first design
- Breakpoints: `sm:`, `md:`, `lg:`
- Tabela com scroll horizontal em mobile

## Utilitários

### Formatadores

```typescript
// Formatar moeda
formatCurrency(3500.00) // "R$ 3.500,00"

// Formatar data
formatDate("2024-12-01T12:00:00Z") // "01/12/24, 12:00"

// Label de status
getStatusLabel(OrderStatus.Pendente) // "Pendente"

// Cor do status
getStatusColor(OrderStatus.Finalizado) // "bg-green-100 text-green-800 ..."
```

## Auto-refresh

### Lista de Pedidos
- Atualiza automaticamente a cada **5 segundos**
- Usa `setInterval` no `useEffect`
- Limpa o intervalo ao desmontar

### Detalhes do Pedido
- Atualiza automaticamente a cada **3 segundos**
- Permite ver mudanças de status em tempo real

## TypeScript

### Tipos Principais

```typescript
// Status do pedido
enum OrderStatus {
  Pendente = 0,
  Processando = 1,
  Finalizado = 2
}

// Interface do pedido
interface Order {
  id: string;
  cliente: string;
  produto: string;
  valor: number;
  status: OrderStatus;
  dataCriacao: string;
  dataAtualizacao?: string;
}

// Request de criação
interface CreateOrderRequest {
  cliente: string;
  produto: string;
  valor: number;
}
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm start

# Build de produção
npm run build

# Testes
npm test

```

## Troubleshooting

### Erro de compilação do Tailwind

Se tiver problemas com o Tailwind, verifique:
1. `tailwind.config.js` está correto
2. `postcss.config.js` está presente
3. Imports do Tailwind estão no `index.css`

### Erro de CORS

Configure o CORS na API para aceitar requisições de `http://localhost:3000`

### API não responde

1. Verifique se a API está rodando em `http://localhost:5000`
2. Confirme a URL no arquivo `.env`
3. Veja o console do navegador para erros

## Deploy

### Build Estático

```bash
npm run build
```

Os arquivos estarão em `build/` prontos para deploy em:
- Netlify
- Vercel
- GitHub Pages
- Qualquer servidor estático

### Docker

A imagem usa Nginx para servir os arquivos estáticos:

```dockerfile
FROM node:18-alpine AS build
# ... build stage

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```
---
