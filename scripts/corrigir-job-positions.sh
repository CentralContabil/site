#!/bin/bash

echo "🔧 Corrigindo configuração de Job Positions..."
echo ""

# 1. Regenerar Prisma Client
echo "1️⃣  Regenerando Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Erro ao regenerar Prisma Client"
    exit 1
fi

echo "✅ Prisma Client regenerado"
echo ""

# 2. Aplicar mudanças no banco
echo "2️⃣  Aplicando mudanças no banco de dados..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Erro ao aplicar mudanças no banco"
    exit 1
fi

echo "✅ Banco de dados atualizado"
echo ""

# 3. Executar seed
echo "3️⃣  Criando áreas de interesse padrão..."
npm run seed:job-positions

if [ $? -ne 0 ]; then
    echo "⚠️  Aviso: Erro ao executar seed (pode ser que já existam áreas)"
else
    echo "✅ Áreas de interesse criadas"
fi

echo ""
echo "✨ Processo concluído!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Reinicie o servidor backend (Ctrl+C e depois npm run server:dev)"
echo "   2. Recarregue a página admin no navegador"


