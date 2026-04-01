#!/bin/bash

# Script para Verificar se a Atualização Funcionou
# Execute na VPS: bash verificar-atualizacao-vps.sh

echo "Verificando atualizacao na VPS..."
echo ""

# 1. Verificar timestamp dos arquivos
echo "1. Timestamp dos arquivos:"
if [ -d "/var/www/central-rnc/assets" ]; then
    echo "   Arquivos JS:"
    find /var/www/central-rnc/assets -name "*.js" -type f -exec ls -lh {} \; | head -3
    echo ""
    echo "   Arquivos CSS:"
    find /var/www/central-rnc/assets -name "*.css" -type f -exec ls -lh {} \; | head -3
fi
echo ""

# 2. Verificar conteúdo do index.html
echo "2. Verificando index.html:"
if [ -f "/var/www/central-rnc/index.html" ]; then
    echo "   Tamanho: $(du -h /var/www/central-rnc/index.html | cut -f1)"
    echo "   Data: $(stat -c '%y' /var/www/central-rnc/index.html)"
    echo "   Contem 'blog.backToHome': $(grep -q 'blog.backToHome' /var/www/central-rnc/index.html && echo 'SIM' || echo 'NAO')"
    echo "   Contem 'common.readMore': $(grep -q 'common.readMore' /var/www/central-rnc/index.html && echo 'SIM' || echo 'NAO')"
else
    echo "   ERRO: index.html nao encontrado!"
fi
echo ""

# 3. Verificar permissões
echo "3. Permissoes:"
ls -ld /var/www/central-rnc
ls -ld /var/www/central-rnc/assets 2>/dev/null || echo "   assets nao encontrado"
echo ""

# 4. Verificar Nginx
echo "4. Status do Nginx:"
sudo systemctl status nginx --no-pager | head -5
echo ""

# 5. Testar localmente
echo "5. Testando localmente:"
curl -I http://localhost/ 2>/dev/null | head -3
echo ""

echo "Se os arquivos foram atualizados recentemente, o problema pode ser cache do navegador."
echo "Limpe o cache ou use modo anonimo."


