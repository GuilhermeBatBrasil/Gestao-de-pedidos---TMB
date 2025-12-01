#!/bin/bash

echo "Parando sistema..."

docker-compose down

echo "Sistema parado!"
echo ""
echo "Para limpar dados: docker-compose down -v"
