#!/bin/bash

# Script para Atualizar Frontend na VPS
# Execute na VPS: bash atualizar-frontend-vps.sh

cd /root/app

echo "=========================================="
echo "Atualizando frontend na VPS..."
echo "=========================================="
echo ""

# 1. Verificar se dist existe
if [ ! -d "dist" ]; then
    echo "ERRO: Pasta 'dist' nao encontrada!"
    echo "Envie os arquivos primeiro usando: scp -r dist/* root@72.60.155.69:/root/app/dist/"
    exit 1
fi

# 2. Remover completamente o diretório antigo
echo "1. Removendo arquivos antigos..."
sudo rm -rf /var/www/central-rnc/*
sudo rm -rf /var/www/central-rnc/.* 2>/dev/null || true
echo "   OK: Arquivos antigos removidos"
echo ""

# 3. Copiar arquivos estáticos para Nginx
echo "2. Copiando arquivos estaticos para Nginx..."
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc
echo "   OK: Arquivos copiados"
echo ""

# 4. Limpar cache do Nginx
echo "3. Limpando cache do Nginx..."
sudo rm -rf /var/cache/nginx/* 2>/dev/null || true
sudo rm -rf /var/lib/nginx/cache/* 2>/dev/null || true
echo "   OK: Cache do Nginx limpo"
echo ""

# 5. Reiniciar Nginx (restart completo, não apenas reload)
echo "4. Reiniciando Nginx..."
sudo systemctl stop nginx
sleep 1
sudo systemctl start nginx
sudo systemctl status nginx --no-pager | head -3
echo "   OK: Nginx reiniciado"
echo ""

# 6. Verificar arquivos copiados
echo "5. Verificando arquivos..."
FILE_COUNT=$(find /var/www/central-rnc -type f | wc -l)
echo "   Arquivos encontrados: $FILE_COUNT"
if [ -f "/var/www/central-rnc/index.html" ]; then
    echo "   OK: index.html encontrado"
    # Verificar timestamp do arquivo JS mais recente
    if [ -d "/var/www/central-rnc/assets" ]; then
        LATEST_JS=$(find /var/www/central-rnc/assets -name "*.js" -type f -printf '%T@ %p\n' | sort -n | tail -1)
        if [ -n "$LATEST_JS" ]; then
            TIMESTAMP=$(echo "$LATEST_JS" | cut -d' ' -f1)
            FILE_NAME=$(echo "$LATEST_JS" | cut -d' ' -f2-)
            DATE_STR=$(date -d "@$TIMESTAMP" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -r "$TIMESTAMP" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "N/A")
            echo "   Arquivo JS mais recente: $(basename "$FILE_NAME")"
            echo "   Data de modificacao: $DATE_STR"
        fi
    fi
else
    echo "   ERRO: index.html nao encontrado!"
fi
echo ""

echo "=========================================="
echo "Atualizacao concluida!"
echo "=========================================="
echo ""
echo "Teste no site: https://central-rnc.com.br/blog"
echo ""
echo "IMPORTANTE: Limpe o cache do navegador!"
echo "  - Pressione Ctrl+Shift+Delete"
echo "  - OU use modo anonimo (Ctrl+Shift+N)"
echo "  - OU pressione Ctrl+F5 na pagina"
echo ""

