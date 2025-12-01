#!/bin/bash

echo "Iniciando Sistema de Gestão de Pedidos..."

# Verificar .env
if [ ! -f .env ]; then
    echo "Criando .env..."
    cp .env.example .env
    echo "Configure o Azure Service Bus no .env antes de continuar!"
    exit 1
fi

# Verificar Docker
if ! docker info > /dev/null 2>&1; then
    echo "Docker não está rodando!"
    exit 1
fi

# Iniciar
docker-compose down 2>/dev/null
docker-compose up --build -d

echo ""
echo "Sistema iniciado!"
echo ""
echo "Acesse:"
echo "   Frontend:   http://localhost:3000"
echo "   API:        http://localhost:5000"
echo "   PgAdmin:    http://localhost:5050 (admin@admin.com / admin)"
echo ""
echo "Ver logs: docker-compose logs -f"
echo "Parar:    ./stop.sh"