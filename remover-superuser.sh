#!/bin/bash

# Script para remover privilégio de superusuário do PostgreSQL
# Execute apenas após confirmar que tudo está funcionando!

echo "⚠️  ATENÇÃO: Este script remove o privilégio de superusuário do PostgreSQL"
echo "   Execute apenas após confirmar que a aplicação está funcionando corretamente!"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada."
    exit 1
fi

echo ""
echo "🔧 Removendo privilégio de superusuário..."
echo ""

sudo -u postgres psql <<EOF
-- Remover privilégio de superusuário
ALTER USER central_rnc_user WITH NOSUPERUSER;

-- Verificar
\du central_rnc_user

\q
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Privilégio de superusuário removido com sucesso!"
    echo ""
    echo "🧪 Testando conexão..."
    PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT version();" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Conexão funcionando normalmente!"
    else
        echo "⚠️  Erro ao testar conexão. Verifique as permissões."
    fi
else
    echo ""
    echo "❌ Erro ao remover privilégio de superusuário"
    exit 1
fi


