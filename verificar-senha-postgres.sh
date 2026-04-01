#!/bin/bash

# Script para verificar e redefinir senha do PostgreSQL
# Execute: bash verificar-senha-postgres.sh

echo "🔍 Verificando configuração do PostgreSQL..."
echo ""

# Tentar diferentes senhas possíveis
SENHAS=(
    "C3ntr4l_RnC_2024!@#Db\$ec"
    "CentralRnc2024Segura"
    "SUA_SENHA_VPS_AQUI"
    "central_rnc_user"
)

echo "📝 Tentando senhas conhecidas..."
echo ""

for senha in "${SENHAS[@]}"; do
    echo "   Tentando: ${senha:0:5}..."
    PGPASSWORD="$senha" psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT 1;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "   ✅ Senha encontrada: $senha"
        SENHA_CORRETA="$senha"
        break
    fi
done

if [ -z "$SENHA_CORRETA" ]; then
    echo "   ❌ Nenhuma senha conhecida funcionou"
    echo ""
    echo "🔧 Redefinindo senha para: SUA_SENHA_VPS_AQUI"
    echo ""
    
    # Redefinir senha
    sudo -u postgres psql <<EOF
ALTER USER central_rnc_user WITH PASSWORD 'SUA_SENHA_VPS_AQUI';
\q
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Senha redefinida com sucesso!"
        SENHA_CORRETA="SUA_SENHA_VPS_AQUI"
    else
        echo "❌ Erro ao redefinir senha"
        exit 1
    fi
fi

echo ""
echo "📝 Atualizando .env..."
cd ~/app || exit 1

# Codificar senha para URL (@ = %40)
ENCODED_PASSWORD=$(echo "$SENHA_CORRETA" | sed 's/@/%40/g')

# Atualizar .env
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"postgresql://central_rnc_user:$ENCODED_PASSWORD@localhost:5432/central_rnc?schema=public\"|g" .env
    echo "✅ .env atualizado com senha codificada"
    echo ""
    echo "🔍 DATABASE_URL atual:"
    grep "^DATABASE_URL" .env
else
    echo "❌ Arquivo .env não encontrado"
fi

echo ""
echo "🧪 Testando conexão..."
PGPASSWORD="$SENHA_CORRETA" psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Conexão testada com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   cd ~/app"
    echo "   npx prisma db push"
else
    echo "⚠️  Não foi possível testar conexão automaticamente"
    echo "   Teste manualmente: psql -U central_rnc_user -d central_rnc -h localhost"
fi


