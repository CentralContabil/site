#!/bin/bash

# Script para Corrigir 403 Forbidden em Uploads
# Execute na VPS: bash corrigir-uploads-403-vps.sh

echo "=========================================="
echo "Corrigindo permissoes de uploads..."
echo "=========================================="
echo ""

cd /root/app

# 1. Verificar se o diretório existe
if [ ! -d "public/uploads" ]; then
    echo "ERRO: Diretorio public/uploads nao encontrado!"
    exit 1
fi

# 2. Corrigir permissões dos diretórios pais
echo "1. Corrigindo permissoes dos diretorios pais..."
sudo chmod 755 /root
sudo chmod 755 /root/app
sudo chmod 755 /root/app/public
echo "   OK: Permissoes dos diretorios pais corrigidas"
echo ""

# 3. Corrigir permissões do diretório uploads
echo "2. Corrigindo permissoes do diretorio uploads..."
sudo chown -R www-data:www-data /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads
echo "   OK: Permissoes do diretorio uploads corrigidas"
echo ""

# 4. Verificar permissões
echo "3. Verificando permissoes..."
ls -la /root/app/public/ | grep uploads
echo ""

# 5. Verificar se Nginx pode acessar
echo "4. Testando acesso do Nginx..."
sudo -u www-data test -r /root/app/public/uploads && echo "   OK: Nginx pode ler o diretorio" || echo "   ERRO: Nginx nao pode ler o diretorio"
echo ""

# 6. Reiniciar Nginx
echo "5. Reiniciando Nginx..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager | head -5
echo ""

# 7. Testar acesso a uma imagem
echo "6. Testando acesso a uma imagem..."
if [ -f "/root/app/public/uploads/$(ls /root/app/public/uploads | head -1)" ]; then
    FIRST_FILE=$(ls /root/app/public/uploads | head -1)
    echo "   Testando: $FIRST_FILE"
    sudo -u www-data test -r "/root/app/public/uploads/$FIRST_FILE" && echo "   OK: Arquivo pode ser lido" || echo "   ERRO: Arquivo nao pode ser lido"
else
    echo "   AVISO: Nenhum arquivo encontrado em uploads/"
fi
echo ""

echo "=========================================="
echo "Correcao concluida!"
echo "=========================================="
echo ""
echo "Teste no navegador:"
echo "  https://central-rnc.com.br/uploads/[nome-do-arquivo]"
echo ""
echo "Se ainda der 403, verifique:"
echo "  1. Configuracao do Nginx: cat /etc/nginx/sites-available/central-rnc | grep uploads"
echo "  2. Logs do Nginx: sudo tail -f /var/log/nginx/central-rnc-error.log"
echo ""


