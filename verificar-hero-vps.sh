#!/bin/bash

# Script para Verificar e Corrigir Dados do Hero na VPS
# Execute: bash verificar-hero-vps.sh

cd /root/app

echo "Verificando dados do Hero na VPS..."
echo ""

# 1. Verificar se existe registro de Hero no banco
echo "1. Verificando registros no banco:"
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT id, badge_text, title_line1, title_line2, stat_years, stat_clients, stat_network, indicator1_value, indicator2_value, indicator3_value FROM hero LIMIT 1;"
echo ""

# 2. Testar API do Hero
echo "2. Testando API do Hero:"
curl -s http://localhost:3006/api/hero | jq '.' || curl -s http://localhost:3006/api/hero
echo ""

# 3. Verificar se arquivo heroes.json existe
echo "3. Verificando arquivo de exportacao:"
if [ -f "dados_exportados/heroes.json" ]; then
    echo "   OK: Arquivo existe"
    echo "   Conteudo:"
    cat dados_exportados/heroes.json | jq '.[0]' || cat dados_exportados/heroes.json
else
    echo "   ERRO: Arquivo heroes.json nao encontrado"
    echo "   Execute: node exportar-dados-local.js (no Windows)"
    echo "   E envie: scp dados_exportados/heroes.json root@72.60.155.69:/root/app/dados_exportados/"
fi
echo ""

echo "Para importar Hero novamente:"
echo "   node -e \"import('./importar-dados-vps.js')\""


