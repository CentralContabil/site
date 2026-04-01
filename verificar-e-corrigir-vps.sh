#!/bin/bash

# Script para verificar e corrigir problemas na VPS
# Execute na VPS: bash verificar-e-corrigir-vps.sh

echo "========================================"
echo "Verificando e Corrigindo VPS"
echo "========================================"
echo ""

cd /root/app

# 1. Verificar se os dados foram importados
echo "1. Verificando dados no banco..."
echo ""

# Verificar configurações
CONFIG_COUNT=$(psql -qtAX -d "$DATABASE_URL" -c "SELECT COUNT(*) FROM configurations;" 2>/dev/null || echo "0")
echo "   Configuracoes: $CONFIG_COUNT"

# Verificar slides
SLIDES_COUNT=$(psql -qtAX -d "$DATABASE_URL" -c "SELECT COUNT(*) FROM slides;" 2>/dev/null || echo "0")
echo "   Slides: $SLIDES_COUNT"

# Verificar serviços
SERVICES_COUNT=$(psql -qtAX -d "$DATABASE_URL" -c "SELECT COUNT(*) FROM services;" 2>/dev/null || echo "0")
echo "   Servicos: $SERVICES_COUNT"

# Verificar depoimentos
TESTIMONIALS_COUNT=$(psql -qtAX -d "$DATABASE_URL" -c "SELECT COUNT(*) FROM testimonials;" 2>/dev/null || echo "0")
echo "   Depoimentos: $TESTIMONIALS_COUNT"

# Verificar hero
HERO_COUNT=$(psql -qtAX -d "$DATABASE_URL" -c "SELECT COUNT(*) FROM heroes;" 2>/dev/null || echo "0")
echo "   Hero: $HERO_COUNT"

echo ""
echo "2. Verificando pasta uploads..."
echo ""

# Verificar se a pasta existe
if [ -d "public/uploads" ]; then
    UPLOAD_COUNT=$(ls -1 public/uploads 2>/dev/null | wc -l)
    echo "   Arquivos em public/uploads: $UPLOAD_COUNT"
else
    echo "   AVISO: Pasta public/uploads nao existe!"
    mkdir -p public/uploads
fi

# Verificar pasta do Nginx
if [ -d "/var/www/central-rnc/uploads" ]; then
    NGINX_UPLOAD_COUNT=$(ls -1 /var/www/central-rnc/uploads 2>/dev/null | wc -l)
    echo "   Arquivos em /var/www/central-rnc/uploads: $NGINX_UPLOAD_COUNT"
else
    echo "   AVISO: Pasta /var/www/central-rnc/uploads nao existe!"
    sudo mkdir -p /var/www/central-rnc/uploads
fi

echo ""
echo "3. Corrigindo pasta uploads..."
echo ""

# Criar pastas se não existirem
mkdir -p public/uploads
sudo mkdir -p /var/www/central-rnc/uploads

# Copiar arquivos de upload
if [ -d "public/uploads" ] && [ "$(ls -A public/uploads 2>/dev/null)" ]; then
    echo "   Copiando arquivos de upload para Nginx..."
    sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    echo "   Arquivos copiados"
else
    echo "   AVISO: Nenhum arquivo encontrado em public/uploads"
fi

# Ajustar permissões
echo "   Ajustando permissoes..."
sudo chown -R www-data:www-data /var/www/central-rnc/uploads
sudo chmod -R 755 /var/www/central-rnc/uploads
sudo chown -R root:root /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads

echo ""
echo "4. Verificando configuracao do Nginx..."
echo ""

NGINX_CONFIG="/etc/nginx/sites-available/central-rnc"
if [ -f "$NGINX_CONFIG" ]; then
    if grep -q "location /uploads" "$NGINX_CONFIG"; then
        echo "   Configuracao do Nginx para /uploads encontrada"
    else
        echo "   Adicionando configuracao do Nginx para /uploads..."
        sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup"
        
        # Adicionar configuração antes do fechamento do bloco server
        sudo sed -i '/^[[:space:]]*location \/ {/a\
    location /uploads {\
        alias /var/www/central-rnc/uploads;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
    }' "$NGINX_CONFIG"
        
        if sudo nginx -t; then
            echo "   Configuracao do Nginx testada com sucesso"
            sudo systemctl reload nginx
            echo "   Nginx recarregado"
        else
            echo "   ERRO: Configuracao do Nginx invalida! Restaurando backup..."
            sudo cp "$NGINX_CONFIG.backup" "$NGINX_CONFIG"
        fi
    fi
else
    echo "   AVISO: Arquivo de configuracao do Nginx nao encontrado: $NGINX_CONFIG"
fi

echo ""
echo "5. Verificando se precisa reimportar dados..."
echo ""

if [ "$CONFIG_COUNT" -eq "0" ] || [ "$SLIDES_COUNT" -eq "0" ]; then
    echo "   AVISO: Dados parecem estar faltando!"
    if [ -f "importar-dados-vps.js" ] && [ -d "dados_exportados" ]; then
        echo "   Reimportando dados..."
        node importar-dados-vps.js
    else
        echo "   AVISO: Script de importacao ou dados nao encontrados"
    fi
else
    echo "   Dados parecem estar OK"
fi

echo ""
echo "6. Verificando status da aplicacao..."
echo ""
pm2 status

echo ""
echo "========================================"
echo "Verificacao concluida!"
echo "========================================"
echo ""
echo "Teste acessando: https://central-rnc.com.br/uploads/[nome-do-arquivo]"
echo ""


