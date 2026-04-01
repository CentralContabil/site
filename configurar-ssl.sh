#!/bin/bash

echo "🔒 Configurando SSL para central-rnc.com.br"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor, execute como root (sudo)${NC}"
    exit 1
fi

# 1. Verificar DNS
echo -e "${YELLOW}1. Verificando DNS...${NC}"
echo ""
echo "Verificando se o domínio aponta para este servidor:"
echo ""

# Obter IP do servidor
SERVER_IP=$(curl -s ifconfig.me)
echo "IP do servidor: $SERVER_IP"

# Verificar DNS
echo ""
echo "Verificando DNS para central-rnc.com.br:"
DNS_IP=$(dig +short central-rnc.com.br @8.8.8.8 | tail -1)
if [ -z "$DNS_IP" ]; then
    echo -e "${RED}❌ Não foi possível resolver o DNS${NC}"
    echo "   Certifique-se de que o DNS está configurado corretamente"
    exit 1
fi

echo "IP do DNS: $DNS_IP"

if [ "$DNS_IP" != "$SERVER_IP" ]; then
    echo -e "${YELLOW}⚠️  O DNS não aponta para este servidor!${NC}"
    echo "   DNS aponta para: $DNS_IP"
    echo "   Servidor está em: $SERVER_IP"
    echo ""
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Cancelado."
        exit 1
    fi
else
    echo -e "${GREEN}✅ DNS configurado corretamente${NC}"
fi

echo ""
echo -e "${YELLOW}2. Verificando Certbot...${NC}"

# Verificar se Certbot está instalado
if ! command -v certbot &> /dev/null; then
    echo "Certbot não encontrado. Instalando..."
    apt update
    apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}✅ Certbot já instalado${NC}"
fi

echo ""
echo -e "${YELLOW}3. Verificando configuração do Nginx...${NC}"

# Verificar se o arquivo de configuração existe
if [ ! -f "/etc/nginx/sites-available/central-rnc" ]; then
    echo -e "${RED}❌ Arquivo de configuração do Nginx não encontrado!${NC}"
    echo "   Arquivo esperado: /etc/nginx/sites-available/central-rnc"
    exit 1
fi

# Verificar se está habilitado
if [ ! -L "/etc/nginx/sites-enabled/central-rnc" ]; then
    echo "Habilitando site..."
    ln -s /etc/nginx/sites-available/central-rnc /etc/nginx/sites-enabled/central-rnc
fi

# Verificar configuração do Nginx
echo "Testando configuração do Nginx..."
if ! nginx -t; then
    echo -e "${RED}❌ Erro na configuração do Nginx!${NC}"
    echo "   Corrija os erros antes de continuar"
    exit 1
fi

echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"

# Recarregar Nginx
echo "Recarregando Nginx..."
systemctl reload nginx

echo ""
echo -e "${YELLOW}4. Verificando acesso ao .well-known...${NC}"

# Criar diretório para validação
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R www-data:www-data /var/www/html/.well-known
chmod -R 755 /var/www/html/.well-known

# Testar acesso
echo "test" > /var/www/html/.well-known/acme-challenge/test.txt
TEST_URL="http://central-rnc.com.br/.well-known/acme-challenge/test.txt"
TEST_RESULT=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL")

if [ "$TEST_RESULT" != "200" ]; then
    echo -e "${YELLOW}⚠️  Aviso: Não foi possível acessar .well-known via HTTP${NC}"
    echo "   Isso pode causar problemas na validação do Certbot"
    echo "   Verifique se o Nginx está configurado corretamente"
else
    echo -e "${GREEN}✅ Acesso ao .well-known funcionando${NC}"
fi

rm -f /var/www/html/.well-known/acme-challenge/test.txt

echo ""
echo -e "${YELLOW}5. Obtendo certificado SSL...${NC}"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Certifique-se de que o DNS está apontando para este servidor"
echo "   - O Let's Encrypt tem rate limits (máx. 5 certificados por domínio por semana)"
echo "   - Se você já tentou várias vezes, pode precisar esperar"
echo ""
read -p "Pressione Enter para continuar ou Ctrl+C para cancelar..."

# Executar Certbot
certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br

# Verificar resultado
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ SSL configurado com sucesso!${NC}"
    echo ""
    echo "📝 Próximos passos:"
    echo "1. Teste o site em: https://central-rnc.com.br"
    echo "2. Verifique se o redirecionamento HTTP -> HTTPS está funcionando"
    echo "3. Teste a renovação automática: sudo certbot renew --dry-run"
    echo ""
    echo "🔒 O certificado será renovado automaticamente pelo Certbot"
else
    echo ""
    echo -e "${RED}❌ Erro ao configurar SSL${NC}"
    echo ""
    echo "Possíveis causas:"
    echo "1. DNS não está apontando para este servidor"
    echo "2. Rate limit do Let's Encrypt (muitas tentativas)"
    echo "3. Problema de conectividade"
    echo ""
    echo "Para verificar logs:"
    echo "sudo tail -f /var/log/letsencrypt/letsencrypt.log"
    exit 1
fi


