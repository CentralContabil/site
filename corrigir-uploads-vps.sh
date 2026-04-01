#!/bin/bash

# Script para corrigir permissões e acesso aos arquivos de upload
# Execute na VPS: bash corrigir-uploads-vps.sh

echo "🔧 Corrigindo acesso aos arquivos de upload..."

cd /root/app

# 1. Verificar se a pasta uploads existe
if [ ! -d "public/uploads" ]; then
    echo "📁 Criando pasta uploads..."
    mkdir -p public/uploads
fi

# 2. Verificar se a pasta uploads existe no diretório do Nginx
if [ ! -d "/var/www/central-rnc/uploads" ]; then
    echo "📁 Criando pasta uploads no Nginx..."
    sudo mkdir -p /var/www/central-rnc/uploads
fi

# 3. Copiar arquivos de upload para o diretório do Nginx
echo "📋 Copiando arquivos de upload..."
if [ -d "public/uploads" ] && [ "$(ls -A public/uploads 2>/dev/null)" ]; then
    sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    echo "✅ Arquivos copiados"
else
    echo "⚠️ Pasta uploads vazia ou não encontrada"
fi

# 4. Ajustar permissões
echo "🔐 Ajustando permissões..."
sudo chown -R www-data:www-data /var/www/central-rnc/uploads
sudo chmod -R 755 /var/www/central-rnc/uploads

# 5. Criar symlink para sincronização futura (opcional)
echo "🔗 Criando symlink para sincronização..."
if [ ! -L "/var/www/central-rnc/uploads" ]; then
    # Remover pasta se existir como diretório normal
    sudo rm -rf /var/www/central-rnc/uploads
    # Criar symlink
    sudo ln -s /root/app/public/uploads /var/www/central-rnc/uploads
    echo "✅ Symlink criado"
else
    echo "✅ Symlink já existe"
fi

# 6. Verificar permissões do diretório da aplicação também
echo "🔐 Ajustando permissões do diretório da aplicação..."
sudo chown -R root:root /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads

# 7. Verificar configuração do Nginx
echo "🔍 Verificando configuração do Nginx..."
if grep -q "location /uploads" /etc/nginx/sites-available/central-rnc 2>/dev/null; then
    echo "✅ Configuração do Nginx encontrada"
else
    echo "⚠️ Configuração do Nginx pode precisar de ajuste"
    echo "   Adicione no bloco server:"
    echo "   location /uploads {"
    echo "       alias /var/www/central-rnc/uploads;"
    echo "       expires 30d;"
    echo "       add_header Cache-Control 'public, immutable';"
    echo "   }"
fi

# 8. Testar acesso
echo ""
echo "📊 Verificando arquivos..."
ls -la /var/www/central-rnc/uploads/ | head -10

echo ""
echo "✅ Correção concluída!"
echo ""
echo "Teste acessando: https://central-rnc.com.br/uploads/[nome-do-arquivo]"


