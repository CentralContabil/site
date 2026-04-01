#!/bin/bash

# Script para redefinir senha do PostgreSQL
# Execute: bash redefinir-senha-postgres.sh

set -e

echo "🔐 Redefinindo senha do PostgreSQL..."
echo ""

# Nova senha
# ⚠️ ALTERE ESTA SENHA para uma senha segura de sua escolha
# Senha atual: SUA_SENHA_VPS_AQUI
NEW_PASSWORD="SUA_SENHA_VPS_AQUI"

echo "📝 Nova senha será: $NEW_PASSWORD"
echo "⚠️  Esta senha será usada no .env"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada"
    exit 1
fi

# Conectar e alterar senha
echo ""
echo "🔧 Alterando senha do usuário central_rnc_user..."
sudo -u postgres psql <<EOF
ALTER USER central_rnc_user WITH PASSWORD '$NEW_PASSWORD';
SELECT 'Senha alterada com sucesso!' as status;
\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ Senha alterada com sucesso!"
    echo ""
    echo "📝 Atualizando .env..."
    
    cd ~/app || exit 1
    
    # Fazer backup
    if [ -f ".env" ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backup criado: .env.backup.*"
    fi
    
    # Atualizar DATABASE_URL (codificar @ como %40)
    ENCODED_PASSWORD=$(echo "$NEW_PASSWORD" | sed 's/@/%40/g')
    if grep -q "^DATABASE_URL" .env; then
        # Substituir linha existente
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"postgresql://central_rnc_user:$ENCODED_PASSWORD@localhost:5432/central_rnc?schema=public\"|g" .env
    else
        # Adicionar se não existir (com senha codificada)
        echo "" >> .env
        echo "DATABASE_URL=\"postgresql://central_rnc_user:$ENCODED_PASSWORD@localhost:5432/central_rnc?schema=public\"" >> .env
    fi
    
    echo "✅ .env atualizado!"
    echo ""
    echo "🔍 Verificando DATABASE_URL:"
    grep "^DATABASE_URL" .env
    echo ""
    echo "🧪 Testando conexão com Prisma..."
    
    # Testar conexão
    if npx prisma migrate deploy --dry-run 2>/dev/null || npx prisma db pull --force 2>/dev/null; then
        echo "✅ Conexão testada com sucesso!"
    else
        echo "⚠️  Não foi possível testar automaticamente, mas a senha foi alterada"
        echo "   Teste manualmente com: npx prisma migrate deploy"
    fi
    
    echo ""
    echo "✅ Processo concluído!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. npx prisma generate"
    echo "   2. npx prisma migrate deploy"
    echo "   3. npm run seed (opcional)"
    
else
    echo "❌ Erro ao alterar senha"
    exit 1
fi

