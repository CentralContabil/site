#!/bin/bash

# Script para testar rotas corretas da API
# Execute: bash testar-rotas-corretas.sh

echo "🧪 Testando Rotas Corretas da API..."
echo ""

BASE_URL="http://localhost:3006"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_endpoint() {
    local endpoint=$1
    local name=$2
    
    echo -n "Testando $name ($endpoint)... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK (200)${NC}"
        # Mostrar primeiras linhas
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
    fi
    echo ""
}

echo "📋 Testando Rotas Locais (localhost:3006):"
echo ""

test_endpoint "/api/health" "Health Check"
test_endpoint "/api/slides" "Slides"
test_endpoint "/api/services" "Services"
test_endpoint "/api/configurations" "Configurations"
test_endpoint "/api/testimonials" "Testimonials"
test_endpoint "/api/hero" "Hero"

echo ""
echo "📋 Testando Rotas via Nginx (localhost):"
echo ""

test_endpoint "http://localhost/api/health" "Health Check (Nginx)"
test_endpoint "http://localhost/api/slides" "Slides (Nginx)"
test_endpoint "http://localhost/api/services" "Services (Nginx)"
test_endpoint "http://localhost/api/configurations" "Configurations (Nginx)"

echo ""
echo "📋 Testando Rotas via Domínio:"
echo ""

test_endpoint "http://central-rnc.com.br/api/health" "Health Check (Domínio)"
test_endpoint "http://central-rnc.com.br/api/slides" "Slides (Domínio)"
test_endpoint "http://central-rnc.com.br/api/services" "Services (Domínio)"
test_endpoint "http://central-rnc.com.br/api/configurations" "Configurations (Domínio)"

echo ""
echo "✅ Teste concluído!"


