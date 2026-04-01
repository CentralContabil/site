#!/bin/bash

# Script para verificar completamente a configuração do Nginx
# Execute: bash verificar-nginx-completo.sh

echo "🔍 Verificando Configuração do Nginx..."
echo ""

# 1. Verificar link simbólico
echo "📋 1. Verificando link simbólico:"
if [ -L "/etc/nginx/sites-enabled/central-rnc" ]; then
    echo "   ✅ Link simbólico existe"
    ls -la /etc/nginx/sites-enabled/central-rnc
    TARGET=$(readlink -f /etc/nginx/sites-enabled/central-rnc)
    echo "   📝 Aponta para: $TARGET"
else
    echo "   ❌ Link simbólico NÃO existe!"
    echo "   🔧 Criando link..."
    sudo ln -s /etc/nginx/sites-available/central-rnc /etc/nginx/sites-enabled/central-rnc
fi
echo ""

# 2. Verificar configurações ativas
echo "📋 2. Configurações ativas:"
sudo ls -la /etc/nginx/sites-enabled/
echo ""

# 3. Verificar se há default interferindo
echo "📋 3. Verificando site default:"
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "   ⚠️  Site default existe e pode estar interferindo"
    echo "   📝 Conteúdo:"
    sudo cat /etc/nginx/sites-enabled/default | grep -A 5 "location /api" || echo "   (sem location /api)"
else
    echo "   ✅ Site default não existe"
fi
echo ""

# 4. Verificar configuração realmente ativa
echo "📋 4. Configuração realmente ativa (nginx -T):"
sudo nginx -T 2>/dev/null | grep -A 30 "server_name central-rnc" | head -40
echo ""

# 5. Verificar proxy_pass na configuração ativa
echo "📋 5. Verificando proxy_pass na configuração ativa:"
sudo nginx -T 2>/dev/null | grep -A 15 "location /api" | head -20
echo ""

# 6. Testar API diretamente
echo "📋 6. Testando API diretamente:"
curl -s http://localhost:3006/api/health | head -3
echo ""

# 7. Verificar logs
echo "📋 7. Últimas linhas do log de erro:"
sudo tail -10 /var/log/nginx/central-rnc-error.log 2>/dev/null || echo "   (sem erros recentes)"
echo ""

# 8. Testar com diferentes configurações de proxy_pass
echo "📋 8. Testando diferentes configurações:"
echo "   Testando com proxy_pass atual..."
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://central-rnc.com.br/api/health
echo ""

echo "✅ Verificação concluída!"


