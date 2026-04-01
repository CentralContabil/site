#!/bin/bash

# Script completo para corrigir permissões do PostgreSQL
# Execute: bash corrigir-permissoes-completo.sh

echo "🔍 Verificando permissões atuais..."
echo ""

# Verificar owner do schema
sudo -u postgres psql -d central_rnc <<EOF
-- Verificar owner do schema
SELECT schema_name, schema_owner 
FROM information_schema.schemata 
WHERE schema_name = 'public';

-- Verificar permissões do usuário
\du central_rnc_user

-- Verificar permissões no schema
\dn+ public
EOF

echo ""
echo "🔧 Aplicando correções..."
echo ""

# Aplicar todas as correções possíveis
sudo -u postgres psql -d central_rnc <<EOF
-- Tornar usuário owner do schema
ALTER SCHEMA public OWNER TO central_rnc_user;

-- Tornar usuário owner do banco de dados
ALTER DATABASE central_rnc OWNER TO central_rnc_user;

-- Conceder todas as permissões possíveis
GRANT ALL ON SCHEMA public TO central_rnc_user;
GRANT CREATE ON SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON DATABASE central_rnc TO central_rnc_user;

-- Conceder permissões em tabelas existentes
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO central_rnc_user;

-- Conceder permissões em objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO central_rnc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO central_rnc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO central_rnc_user;

-- Verificar novamente
SELECT schema_name, schema_owner 
FROM information_schema.schemata 
WHERE schema_name = 'public';

\q
EOF

echo ""
echo "🧪 Testando criação de tabela..."
echo ""

# Testar se consegue criar tabela
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost <<EOF
-- Tentar criar uma tabela de teste
CREATE TABLE IF NOT EXISTS teste_permissao (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100)
);

-- Se funcionou, remover
DROP TABLE IF EXISTS teste_permissao;

SELECT 'Permissões OK!' as status;
\q
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Permissões corrigidas! Testando Prisma..."
    echo ""
    cd ~/app
    npx prisma db push
else
    echo ""
    echo "❌ Ainda há problemas. Tentando tornar usuário superusuário temporariamente..."
    echo ""
    
    # Tornar superusuário temporariamente (apenas para criar schema)
    sudo -u postgres psql <<EOF
ALTER USER central_rnc_user WITH SUPERUSER;
\q
EOF
    
    echo "🔄 Tentando Prisma novamente..."
    cd ~/app
    npx prisma db push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Schema criado! Removendo privilégios de superusuário..."
        sudo -u postgres psql <<EOF
ALTER USER central_rnc_user WITH NOSUPERUSER;
\q
EOF
    fi
fi


