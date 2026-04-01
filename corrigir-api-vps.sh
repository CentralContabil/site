#!/bin/bash

# Script para corrigir API que parou de responder após deploy
# Execute na VPS: bash corrigir-api-vps.sh

echo "🔧 Iniciando correção da API..."

cd /root/app

# 1. Verificar status do PM2
echo "📊 Verificando status do PM2..."
pm2 status

# 2. Ver logs de erro
echo ""
echo "📋 Últimos logs de erro:"
pm2 logs central-rnc --lines 50 --err

# 3. Parar aplicação
echo ""
echo "⏹️ Parando aplicação..."
pm2 stop central-rnc

# 4. Verificar se o schema está correto
echo ""
echo "📝 Verificando schema..."
if [ -f prisma/schema.production.prisma ]; then
    echo "✅ Schema de produção encontrado"
    cp prisma/schema.production.prisma prisma/schema.prisma
    echo "✅ Schema atualizado"
else
    echo "⚠️ Schema de produção não encontrado, usando schema padrão"
fi

# 5. Regenerar Prisma Client
echo ""
echo "🔄 Regenerando Prisma Client..."
rm -rf node_modules/.prisma
npx prisma generate

# 6. Verificar se há erros de sintaxe no código
echo ""
echo "🔍 Verificando erros de sintaxe..."
if command -v node &> /dev/null; then
    node -c api/app.ts 2>&1 || echo "⚠️ Erro de sintaxe detectado"
fi

# 7. Aplicar migrações do banco
echo ""
echo "🗄️ Aplicando migrações do banco..."
npx prisma db push --accept-data-loss

# 8. Reiniciar aplicação
echo ""
echo "🚀 Reiniciando aplicação..."
pm2 restart central-rnc || pm2 start ecosystem.config.cjs --name central-rnc
pm2 save

# 9. Aguardar e verificar status
echo ""
echo "⏳ Aguardando 5 segundos..."
sleep 5

echo ""
echo "📊 Status final:"
pm2 status

echo ""
echo "📋 Últimos logs:"
pm2 logs central-rnc --lines 20 --nostream

echo ""
echo "✅ Correção concluída!"
echo ""
echo "Se ainda houver problemas, verifique os logs com:"
echo "   pm2 logs central-rnc --lines 100"
