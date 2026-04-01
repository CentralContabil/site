#!/bin/bash

# Script para verificar e corrigir .env na VPS
# Execute: bash verificar-env-vps.sh

echo "🔍 Verificando arquivo .env..."
echo ""

cd ~/app || exit 1

if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo ""
    echo "📝 Criando arquivo .env..."
    cat > .env << 'EOF'
# Ambiente
NODE_ENV=production

# Porta do servidor
PORT=3006

# JWT Secret (gere um novo: openssl rand -base64 32)
JWT_SECRET=GERE_UM_JWT_SECRET_SUPER_SEGURO_AQUI

# Banco de Dados PostgreSQL
# ⚠️ IMPORTANTE: Codifique caracteres especiais na senha!
# Senha: C3ntr4l_RnC_2024!@#Db$ec
# Caracteres especiais devem ser codificados:
# ! = %21
# @ = %40
# # = %23
# $ = %24
DATABASE_URL="postgresql://central_rnc_user:C3ntr4l_RnC_2024%21%40%23Db%24ec@localhost:5432/central_rnc?schema=public"

# Email (SMTP) - CONFIGURE ESTES VALORES
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# URL da aplicação
APP_URL=https://central-rnc.com.br
EOF
    echo "✅ Arquivo .env criado!"
else
    echo "✅ Arquivo .env encontrado"
fi

echo ""
echo "📋 Conteúdo atual do DATABASE_URL:"
grep "^DATABASE_URL" .env || echo "   ⚠️  DATABASE_URL não encontrado"

echo ""
echo "🔧 Verificando formato da DATABASE_URL..."

# Verificar se a URL está correta
DB_URL=$(grep "^DATABASE_URL" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL está vazia!"
    exit 1
fi

# Verificar se contém localhost
if echo "$DB_URL" | grep -q "localhost"; then
    echo "✅ Host encontrado: localhost"
else
    echo "⚠️  Host não encontrado ou incorreto"
fi

# Verificar se contém porta
if echo "$DB_URL" | grep -q ":5432"; then
    echo "✅ Porta encontrada: 5432"
else
    echo "⚠️  Porta não encontrada ou incorreto"
fi

# Verificar se contém nome do banco
if echo "$DB_URL" | grep -q "central_rnc"; then
    echo "✅ Nome do banco encontrado: central_rnc"
else
    echo "⚠️  Nome do banco não encontrado"
fi

echo ""
echo "💡 Se houver problemas, verifique:"
echo "   1. A senha está codificada corretamente (caracteres especiais)"
echo "   2. O formato está correto: postgresql://usuario:senha@host:porta/banco"
echo "   3. Não há espaços extras ou caracteres inválidos"
echo ""
echo "📝 Para editar manualmente:"
echo "   nano ~/app/.env"


