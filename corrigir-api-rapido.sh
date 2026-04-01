#!/bin/bash

# Script Rápido para Corrigir API Parada
# Execute na VPS: bash corrigir-api-rapido.sh

cd /root/app

echo "Parando aplicacao..."
pm2 stop central-rnc 2>/dev/null || true
pm2 delete central-rnc 2>/dev/null || true

echo "Regenerando Prisma Client..."
npx prisma generate

echo "Reiniciando aplicacao..."
pm2 start ecosystem.config.cjs --name central-rnc
pm2 save

echo "Aguardando 3 segundos..."
sleep 3

echo "Status:"
pm2 status

echo ""
echo "Testando API:"
curl -s http://localhost:3006/api/health || echo "ERRO: API nao responde"

echo ""
echo "Para ver logs: pm2 logs central-rnc --lines 50"


