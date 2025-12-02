# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### 1. Create Order

Cria um novo pedido no sistema.

**Endpoint:** `POST /api/orders`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "cliente": "string (min 3 chars, required)",
  "produto": "string (min 3 chars, required)",
  "valor": "decimal (> 0, required)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "João Silva",
    "produto": "Notebook Dell XPS 15",
    "valor": 8500.00
  }'
```

**Response (201 Created):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "cliente": "João Silva",
  "produto": "Notebook Dell XPS 15",
  "valor": 8500.00,
  "status": 0,
  "dataCriacao": "2024-12-01T12:00:00Z",
  "dataAtualizacao": null
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Cliente": ["Cliente é obrigatório"],
    "Produto": ["Produto deve ter no mínimo 3 caracteres"],
    "Valor": ["Valor deve ser maior que zero"]
  }
}
```

---

### 2. List Orders

Lista todos os pedidos com paginação e filtros opcionais.

**Endpoint:** `GET /api/orders`

**Query Parameters:**
- `status` (optional): Filtrar por status (0=Pendente, 1=Processando, 2=Finalizado)
- `page` (optional, default=1): Número da página
- `pageSize` (optional, default=50): Itens por página

**Example Requests:**
```bash
# Listar todos os pedidos
curl http://localhost:5000/api/orders

# Listar apenas pedidos finalizados
curl http://localhost:5000/api/orders?status=2

# Listar com paginação
curl http://localhost:5000/api/orders?page=2&pageSize=20

# Combinar filtros
curl http://localhost:5000/api/orders?status=1&page=1&pageSize=10
```

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "cliente": "João Silva",
    "produto": "Notebook Dell XPS 15",
    "valor": 8500.00,
    "status": 2,
    "dataCriacao": "2024-12-01T12:00:00Z",
    "dataAtualizacao": "2024-12-01T12:00:10Z"
  },
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "cliente": "Maria Santos",
    "produto": "iPhone 15 Pro",
    "valor": 9500.00,
    "status": 1,
    "dataCriacao": "2024-12-01T11:55:00Z",
    "dataAtualizacao": "2024-12-01T12:00:05Z"
  }
]
```

---

### 3. Get Order by ID

Obtém os detalhes de um pedido específico.

**Endpoint:** `GET /api/orders/{id}`

**Path Parameters:**
- `id` (required): UUID do pedido

**Example Request:**
```bash
curl http://localhost:5000/api/orders/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Response (200 OK):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "cliente": "João Silva",
  "produto": "Notebook Dell XPS 15",
  "valor": 8500.00,
  "status": 2,
  "dataCriacao": "2024-12-01T12:00:00Z",
  "dataAtualizacao": "2024-12-01T12:00:10Z"
}
```

**Not Found (404):**
```json
{
  "message": "Order 3fa85f64-5717-4562-b3fc-2c963f66afa6 not found"
}
```

---

## Health Checks

### Health Check (All Services)

**Endpoint:** `GET /health`

**Example Request:**
```bash
curl http://localhost:5000/health
```

**Response (200 Healthy):**
```json
{
  "status": "Healthy",
  "results": {
    "database": {
      "status": "Healthy",
      "description": null,
      "data": {}
    },
    "servicebus": {
      "status": "Healthy",
      "description": null,
      "data": {}
    }
  }
}
```

**Response (503 Unhealthy):**
```json
{
  "status": "Unhealthy",
  "results": {
    "database": {
      "status": "Unhealthy",
      "description": "Connection failed",
      "data": {}
    }
  }
}
```

---

## Order Status Values

| Value | Status       | Description                              |
|-------|--------------|------------------------------------------|
| 0     | Pendente     | Order created, waiting for processing    |
| 1     | Processando  | Worker is processing the order           |
| 2     | Finalizado   | Order successfully processed             |

---

## Data Types

### Order Model

```typescript
interface Order {
  id: string;              // UUID
  cliente: string;         // Customer name (min 3 chars)
  produto: string;         // Product name (min 3 chars)
  valor: number;           // Price (> 0, precision 18,2)
  status: OrderStatus;     // 0, 1, or 2
  dataCriacao: string;     // ISO 8601 datetime (UTC)
  dataAtualizacao?: string; // ISO 8601 datetime (UTC), nullable
}
```

### Create Order Request

```typescript
interface CreateOrderRequest {
  cliente: string;   // Required, min 3 chars
  produto: string;   // Required, min 3 chars
  valor: number;     // Required, > 0
}
```

---

## Error Responses

### 400 Bad Request
Validation errors or invalid data format.

### 404 Not Found
Order with specified ID does not exist.

### 500 Internal Server Error
Unexpected server error.

```json
{
  "message": "An error occurred while processing your request"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

---

## CORS

CORS is configured to allow requests from:
- http://localhost:3000
- http://localhost:5173

All headers and methods are allowed.

---

## Swagger/OpenAPI

Interactive API documentation available at:

```
http://localhost:5000/swagger
```

Features:
- Try out endpoints directly
- View request/response schemas
- Download OpenAPI specification

---

## Service Bus Integration

When an order is created:

1. Order is saved to PostgreSQL with status "Pendente"
2. Message is published to Azure Service Bus queue "orders"

**Message Format:**
```json
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "cliente": "João Silva",
  "produto": "Notebook Dell XPS 15",
  "valor": 8500.00,
  "eventType": "OrderCreated"
}
```

**Message Properties:**
- `CorrelationId`: Order ID (UUID)
- `ContentType`: "application/json"
- `ApplicationProperties.EventType`: "OrderCreated"

---

## Examples

### JavaScript/Fetch

```javascript
// Create Order
const response = await fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    cliente: 'João Silva',
    produto: 'Notebook Dell',
    valor: 8500.00
  })
});

const order = await response.json();
console.log('Order created:', order);
```

### Python/Requests

```python
import requests

# Create Order
response = requests.post(
    'http://localhost:5000/api/orders',
    json={
        'cliente': 'João Silva',
        'produto': 'Notebook Dell',
        'valor': 8500.00
    }
)

order = response.json()
print('Order created:', order)
```

### C#/HttpClient

```csharp
using var client = new HttpClient();

// Create Order
var order = new {
    cliente = "João Silva",
    produto = "Notebook Dell",
    valor = 8500.00
};

var response = await client.PostAsJsonAsync(
    "http://localhost:5000/api/orders",
    order
);

var createdOrder = await response.Content.ReadFromJsonAsync<Order>();
Console.WriteLine($"Order created: {createdOrder.Id}");
```
