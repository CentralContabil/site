#!/bin/bash

# Script para Diagnosticar e Corrigir API Parada na VPS
# Execute na VPS: bash corrigir-api-parada-vps.sh

echo "=========================================="
echo "Diagnosticando API na VPS..."
echo "=========================================="
echo ""

cd /root/app

# 1. Verificar status do PM2
echo "1. Verificando status do PM2..."
pm2 status
echo ""

# 2. Verificar se a aplicação está rodando
echo "2. Verificando se a aplicação está rodando..."
if pm2 list | grep -q "central-rnc.*online"; then
    echo "   OK: Aplicação está rodando"
else
    echo "   ERRO: Aplicação NÃO está rodando!"
    echo "   Tentando reiniciar..."
    pm2 restart central-rnc || pm2 start ecosystem.config.cjs --name central-rnc
    pm2 save
fi
echo ""

# 3. Verificar logs recentes
echo "3. Últimos logs da aplicação (últimas 20 linhas):"
pm2 logs central-rnc --lines 20 --nostream
echo ""

# 4. Verificar se a porta 3006 está em uso
echo "4. Verificando porta 3006..."
if lsof -i :3006 > /dev/null 2>&1; then
    echo "   OK: Porta 3006 está em uso"
    lsof -i :3006 | head -3
else
    echo "   ERRO: Porta 3006 NÃO está em uso!"
    echo "   A aplicação pode não estar escutando na porta correta"
fi
echo ""

# 5. Testar API localmente
echo "5. Testando API localmente..."
curl -s http://localhost:3006/api/health || curl -s http://localhost:3006/health || echo "   ERRO: API não responde localmente"
echo ""

# 6. Verificar Prisma Client
echo "6. Verificando Prisma Client..."
if [ -d "node_modules/.prisma" ]; then
    echo "   OK: Prisma Client existe"
else
    echo "   AVISO: Prisma Client não encontrado, regenerando..."
    npx prisma generate
fi
echo ""

# 7. Verificar .env
echo "7. Verificando arquivo .env..."
if [ -f ".env" ]; then
    echo "   OK: Arquivo .env existe"
    if grep -q "DATABASE_URL" .env; then
        echo "   OK: DATABASE_URL configurado"
    else
        echo "   ERRO: DATABASE_URL não encontrado no .env!"
    fi
else
    echo "   ERRO: Arquivo .env não encontrado!"
fi
echo ""

# 8. Verificar Nginx
echo "8. Verificando configuração do Nginx..."
if nginx -t > /dev/null 2>&1; then
    echo "   OK: Configuração do Nginx está válida"
else
    echo "   ERRO: Configuração do Nginx inválida!"
    nginx -t
fi
echo ""

# 9. Testar API via Nginx
echo "9. Testando API via Nginx..."
curl -s https://central-rnc.com.br/api/health || curl -s http://localhost/api/health || echo "   ERRO: API não responde via Nginx"
echo ""

# 10. Tentar corrigir
echo "=========================================="
echo "Tentando corrigir problemas..."
echo "=========================================="
echo ""

# Regenerar Prisma Client
echo "Regenerando Prisma Client..."
npx prisma generate
echo ""

# Reiniciar PM2
echo "Reiniciando PM2..."
pm2 restart central-rnc
pm2 save
sleep 3
echo ""

# Verificar status novamente
echo "Status após correção:"
pm2 status
echo ""

# Testar API novamente
echo "Testando API novamente..."
sleep 2
if curl -s http://localhost:3006/api/health > /dev/null 2>&1; then
    echo "   OK: API está respondendo localmente"
else
    echo "   ERRO: API ainda não responde"
    echo ""
    echo "   Verifique os logs:"
    echo "   pm2 logs central-rnc --lines 50"
fi
echo ""

echo "=========================================="
echo "Diagnóstico concluído!"
echo "=========================================="
echo ""
echo "Se a API ainda não estiver funcionando:"
echo "  1. Verifique os logs: pm2 logs central-rnc --lines 50"
echo "  2. Verifique o .env: cat .env | grep DATABASE_URL"
echo "  3. Verifique a porta: lsof -i :3006"
echo ""


