#!/bin/bash

echo "🔧 Corrigindo permissões completas para uploads..."

# O problema: /root/app/public tem permissões 700 (drwx------)
# O Nginx precisa ter permissão de execução (x) nos diretórios pais para navegar até uploads

echo ""
echo "1. Verificando permissões atuais dos diretórios pais..."
ls -la /root/app/ | grep public
ls -la /root/app/public/ | grep uploads

echo ""
echo "2. Corrigindo permissões dos diretórios pais..."
# Dar permissão de execução (x) nos diretórios pais para www-data poder navegar
sudo chmod 755 /root
sudo chmod 755 /root/app
sudo chmod 755 /root/app/public

echo ""
echo "3. Corrigindo permissões da pasta uploads..."
sudo chown -R www-data:www-data /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads

echo ""
echo "4. Verificando permissões corrigidas..."
ls -la /root/app/ | grep public
ls -la /root/app/public/ | grep uploads

echo ""
echo "5. Testando se o Nginx consegue acessar..."
sudo -u www-data ls -la /root/app/public/uploads/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Nginx consegue acessar a pasta!"
else
    echo "❌ Nginx ainda não consegue acessar. Verificando SELinux..."
    getenforce 2>/dev/null || echo "SELinux não está ativo"
fi

echo ""
echo "6. Recarregando Nginx..."
sudo systemctl reload nginx

echo ""
echo "7. Testando acesso via HTTP..."
if [ -f "/root/app/public/uploads/164a7fc8-d492-46d1-9b93-42cff146166b.png" ]; then
    echo "🧪 Testando: http://central-rnc.com.br/uploads/164a7fc8-d492-46d1-9b93-42cff146166b.png"
    curl -I "http://central-rnc.com.br/uploads/164a7fc8-d492-46d1-9b93-42cff146166b.png" 2>&1 | head -3
else
    first_file=$(find /root/app/public/uploads -type f | head -1)
    if [ -n "$first_file" ]; then
        filename=$(basename "$first_file")
        echo "🧪 Testando: http://central-rnc.com.br/uploads/$filename"
        curl -I "http://central-rnc.com.br/uploads/$filename" 2>&1 | head -3
    fi
fi

echo ""
echo "✅ Correção completa!"
echo ""
echo "📝 Se ainda houver erro 403, pode ser necessário:"
echo "   1. Verificar se o Nginx está usando a configuração correta"
echo "   2. Verificar logs: sudo tail -20 /var/log/nginx/central-rnc-error.log"


