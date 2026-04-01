#!/bin/bash

echo "🔍 Diagnosticando problema de uploads (403 Forbidden)..."

# 1. Verificar se a pasta existe
echo ""
echo "1. Verificando se a pasta de uploads existe..."
if [ -d "/root/app/public/uploads" ]; then
    echo "✅ Pasta /root/app/public/uploads existe"
    ls -la /root/app/public/uploads/ | head -10
else
    echo "❌ Pasta /root/app/public/uploads NÃO existe"
    echo "📁 Criando pasta..."
    mkdir -p /root/app/public/uploads
fi

# 2. Verificar permissões atuais
echo ""
echo "2. Verificando permissões atuais..."
ls -la /root/app/public/ | grep uploads

# 3. Corrigir permissões
echo ""
echo "3. Corrigindo permissões..."
sudo chown -R www-data:www-data /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads

# 4. Verificar configuração do Nginx
echo ""
echo "4. Verificando configuração do Nginx para /uploads..."
if grep -q "location /uploads" /etc/nginx/sites-available/central-rnc; then
    echo "✅ Configuração encontrada:"
    sudo grep -A 5 "location /uploads" /etc/nginx/sites-available/central-rnc
else
    echo "❌ Configuração NÃO encontrada!"
    echo "⚠️  Precisamos adicionar a configuração no Nginx"
fi

# 5. Verificar se há arquivos na pasta
echo ""
echo "5. Verificando arquivos na pasta de uploads..."
file_count=$(find /root/app/public/uploads -type f 2>/dev/null | wc -l)
echo "📊 Total de arquivos: $file_count"
if [ "$file_count" -gt 0 ]; then
    echo "📁 Primeiros arquivos:"
    find /root/app/public/uploads -type f | head -5
fi

# 6. Testar acesso
echo ""
echo "6. Testando acesso via Nginx..."
if [ "$file_count" -gt 0 ]; then
    first_file=$(find /root/app/public/uploads -type f | head -1)
    filename=$(basename "$first_file")
    echo "🧪 Testando: http://central-rnc.com.br/uploads/$filename"
    curl -I "http://central-rnc.com.br/uploads/$filename" 2>&1 | head -5
else
    echo "⚠️  Nenhum arquivo para testar. Crie um arquivo de teste primeiro."
fi

# 7. Verificar logs do Nginx
echo ""
echo "7. Últimas linhas do log de erro do Nginx:"
sudo tail -10 /var/log/nginx/central-rnc-error.log 2>/dev/null || echo "Log não encontrado"

echo ""
echo "✅ Diagnóstico completo!"
echo ""
echo "📝 Próximos passos:"
echo "1. Se ainda houver erro 403, verifique se o Nginx tem a configuração correta"
echo "2. Recarregue o Nginx: sudo systemctl reload nginx"
echo "3. Tente fazer upload novamente"


