#!/bin/bash

# Script para Atualizar Frontend na VPS (FORÇADO - Limpa Caches)
# Execute na VPS: bash atualizar-frontend-vps-forcado.sh

cd /root/app

echo "=========================================="
echo "Atualizando frontend na VPS (FORCADO)..."
echo "=========================================="
echo ""

# 1. Verificar se dist existe
if [ ! -d "dist" ]; then
    echo "ERRO: Pasta 'dist' nao encontrada!"
    echo "Envie os arquivos primeiro usando: scp -r dist/* root@72.60.155.69:/root/app/dist/"
    exit 1
fi

# 2. Fazer backup do diretório atual (opcional)
echo "1. Fazendo backup do diretorio atual..."
sudo cp -r /var/www/central-rnc /var/www/central-rnc.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
echo "   OK: Backup criado"
echo ""

# 3. Remover completamente o diretório antigo
echo "2. Removendo arquivos antigos..."
sudo rm -rf /var/www/central-rnc/*
sudo rm -rf /var/www/central-rnc/.* 2>/dev/null || true
echo "   OK: Arquivos antigos removidos"
echo ""

# 4. Copiar arquivos estáticos para Nginx
echo "3. Copiando arquivos estaticos para Nginx..."
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc
echo "   OK: Arquivos copiados"
echo ""

# 5. Limpar cache do Nginx
echo "4. Limpando cache do Nginx..."
sudo rm -rf /var/cache/nginx/* 2>/dev/null || true
sudo rm -rf /var/lib/nginx/cache/* 2>/dev/null || true
echo "   OK: Cache do Nginx limpo"
echo ""

# 6. Reiniciar Nginx (não apenas reload)
echo "5. Reiniciando Nginx..."
sudo systemctl stop nginx
sleep 2
sudo systemctl start nginx
sudo systemctl status nginx --no-pager | head -5
echo "   OK: Nginx reiniciado"
echo ""

# 7. Verificar arquivos
echo "6. Verificando arquivos copiados..."
FILE_COUNT=$(find /var/www/central-rnc -type f | wc -l)
echo "   Arquivos encontrados: $FILE_COUNT"
if [ -f "/var/www/central-rnc/index.html" ]; then
    echo "   OK: index.html encontrado"
    echo "   Tamanho: $(du -h /var/www/central-rnc/index.html | cut -f1)"
else
    echo "   ERRO: index.html nao encontrado!"
fi
echo ""

# 8. Verificar permissões
echo "7. Verificando permissoes..."
PERM_OWNER=$(stat -c '%U:%G' /var/www/central-rnc)
if [ "$PERM_OWNER" = "www-data:www-data" ]; then
    echo "   OK: Permissoes corretas ($PERM_OWNER)"
else
    echo "   AVISO: Permissoes podem estar incorretas ($PERM_OWNER)"
fi
echo ""

# 9. Verificar timestamp do arquivo JS principal
echo "8. Verificando timestamp dos arquivos..."
if [ -d "/var/www/central-rnc/assets" ]; then
    LATEST_JS=$(find /var/www/central-rnc/assets -name "*.js" -type f -printf '%T@ %p\n' | sort -n | tail -1)
    if [ -n "$LATEST_JS" ]; then
        TIMESTAMP=$(echo "$LATEST_JS" | cut -d' ' -f1)
        FILE_NAME=$(echo "$LATEST_JS" | cut -d' ' -f2-)
        DATE_STR=$(date -d "@$TIMESTAMP" '+%Y-%m-%d %H:%M:%S')
        echo "   Arquivo JS mais recente: $(basename "$FILE_NAME")"
        echo "   Data de modificacao: $DATE_STR"
    fi
fi
echo ""

echo "=========================================="
echo "Atualizacao concluida!"
echo "=========================================="
echo ""
echo "Teste no site: https://central-rnc.com.br/blog"
echo ""
echo "Se ainda nao atualizou:"
echo "  1. Limpe o cache do navegador (Ctrl+Shift+Delete)"
echo "  2. Ou use modo anonimo/privado"
echo "  3. Ou adicione ?v=$(date +%s) na URL"
echo ""


