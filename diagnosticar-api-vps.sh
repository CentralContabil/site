#!/bin/bash

# Script de Diagnóstico e Correção da API na VPS
# Execute: bash diagnosticar-api-vps.sh

echo "🔍 Diagnosticando API na VPS..."
echo ""

# 1. Verificar status do PM2
echo "1. Verificando status do PM2..."
pm2 status
echo ""

# 2. Verificar logs recentes
echo "2. Últimas 30 linhas dos logs:"
pm2 logs central-rnc --lines 30 --nostream
echo ""

# 3. Verificar se a porta 3006 está em uso
echo "3. Verificando porta 3006:"
lsof -i :3006 || netstat -tulpn | grep 3006 || echo "Porta 3006 não está em uso"
echo ""

# 4. Testar API localmente
echo "4. Testando API localmente:"
curl -s http://localhost:3006/api/health || echo "❌ API não responde"
echo ""

# 5. Verificar Prisma Client
echo "5. Verificando Prisma Client:"
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma Client existe"
else
    echo "❌ Prisma Client não encontrado"
fi
echo ""

# 6. Verificar .env
echo "6. Verificando variáveis de ambiente:"
if [ -f ".env" ]; then
    echo "✅ Arquivo .env existe"
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL configurada"
    else
        echo "❌ DATABASE_URL não encontrada"
    fi
else
    echo "❌ Arquivo .env não encontrado"
fi
echo ""

# 7. Verificar conexão com banco
echo "7. Testando conexão com banco de dados:"
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT 1;" 2>&1 | head -1
echo ""

echo "📋 Diagnóstico concluído!"
echo ""
echo "💡 Próximos passos:"
echo "   - Se PM2 não estiver rodando: pm2 start ecosystem.config.cjs --name central-rnc"
echo "   - Se houver erros nos logs: pm2 logs central-rnc --lines 50"
echo "   - Se Prisma Client estiver faltando: npx prisma generate"
echo "   - Se houver erro de banco: npx prisma db push"
