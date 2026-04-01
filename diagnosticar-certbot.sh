#!/bin/bash

# Script para diagnosticar problema do Certbot

echo "🔍 Diagnosticando problema do Certbot..."
echo ""

# 1. Verificar logs do Nginx
echo "📋 Últimas linhas do log de erro do Nginx:"
sudo tail -30 /var/log/nginx/central-rnc-error.log
echo ""

# 2. Verificar se o diretório .well-known existe
echo "📁 Verificando diretório .well-known:"
ls -la /var/www/html/.well-known/ 2>/dev/null || echo "❌ Diretório não existe"
echo ""

# 3. Criar diretório se não existir
echo "🔧 Criando diretório .well-known se necessário:"
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html/.well-known
sudo chmod -R 755 /var/www/html/.well-known
echo "✅ Diretório criado/verificado"
echo ""

# 4. Verificar configuração atual do Nginx
echo "📋 Configuração atual do Nginx para .well-known:"
sudo grep -A 5 "\.well-known" /etc/nginx/sites-available/central-rnc
echo ""

# 5. Testar acesso HTTP
echo "🧪 Testando acesso HTTP:"
curl -I http://central-rnc.com.br/.well-known/acme-challenge/test 2>&1 | head -5
echo ""

echo "✅ Diagnóstico concluído!"


