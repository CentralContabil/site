#!/bin/bash

# Script para testar todas as rotas da API
# Execute: bash testar-rotas-api.sh

echo "🧪 Testando Rotas da API..."
echo ""

BASE_URL="http://localhost:3006"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local endpoint=$1
    local name=$2
    
    echo -n "Testando $name ($endpoint)... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK (200)${NC}"
        # Mostrar primeiras linhas da resposta
        echo "   Resposta:"
        curl -s "$BASE_URL$endpoint" | head -3 | sed 's/^/   /'
    elif [ "$response" = "404" ]; then
        echo -e "${RED}❌ Não encontrado (404)${NC}"
    elif [ "$response" = "500" ]; then
        echo -e "${RED}❌ Erro do servidor (500)${NC}"
        echo "   Detalhes:"
        curl -s "$BASE_URL$endpoint" | head -5 | sed 's/^/   /'
    else
        echo -e "${YELLOW}⚠️  Resposta: $response${NC}"
        curl -s "$BASE_URL$endpoint" | head -3 | sed 's/^/   /'
    fi
    echo ""
}

# Testar rotas principais
echo "📋 Rotas Públicas:"
echo ""

test_endpoint "/api/health" "Health Check"
test_endpoint "/api/slides" "Slides"
test_endpoint "/api/services" "Services"
test_endpoint "/api/configurations" "Configurations"
test_endpoint "/api/testimonials" "Testimonials"
test_endpoint "/api/hero" "Hero"
test_endpoint "/api/blog/posts" "Blog Posts"

echo ""
echo "📋 Verificando Logs do PM2:"
echo ""

# Ver últimas linhas dos logs
pm2 logs central-rnc --lines 20 --nostream | tail -10

echo ""
echo "✅ Teste concluído!"
echo ""
echo "💡 Se alguma rota falhar, verifique os logs acima."


