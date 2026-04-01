#!/bin/bash

# Script para testar e corrigir permissões do PostgreSQL
# Execute: bash testar-permissoes-postgres.sh

echo "🔍 Testando permissões do PostgreSQL..."
echo ""

# Conectar ao banco central_rnc diretamente
echo "📝 Conectando ao banco central_rnc..."
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost <<EOF

-- Verificar owner do schema
SELECT schema_name, schema_owner 
FROM information_schema.schemata 
WHERE schema_name = 'public';

-- Verificar permissões do usuário
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE grantee = 'central_rnc_user' 
LIMIT 5;

-- Tentar criar uma tabela de teste
CREATE TABLE IF NOT EXISTS teste_permissao (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100)
);

-- Se funcionou, remover a tabela
DROP TABLE IF EXISTS teste_permissao;

\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ Permissões estão corretas!"
    echo ""
    echo "🔧 Verificando configuração do Prisma..."
    cd ~/app || exit 1
    
    # Verificar DATABASE_URL no .env
    if [ -f ".env" ]; then
        echo "📋 DATABASE_URL atual:"
        grep "^DATABASE_URL" .env
        echo ""
        
        # Verificar se está usando o banco correto
        if grep -q "central_rnc" .env; then
            echo "✅ DATABASE_URL parece correto"
        else
            echo "⚠️  DATABASE_URL pode estar incorreto"
        fi
    fi
    
    echo ""
    echo "🧪 Tentando npx prisma db push novamente..."
    npx prisma db push
else
    echo "❌ Erro ao testar permissões"
    echo ""
    echo "🔧 Tentando corrigir novamente..."
    
    sudo -u postgres psql -d central_rnc <<EOF
-- Conceder todas as permissões possíveis
ALTER SCHEMA public OWNER TO central_rnc_user;
GRANT ALL ON SCHEMA public TO central_rnc_user;
GRANT CREATE ON SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON DATABASE central_rnc TO central_rnc_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO central_rnc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO central_rnc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO central_rnc_user;

-- Verificar
\dn+ public
\du central_rnc_user

\q
EOF
fi


