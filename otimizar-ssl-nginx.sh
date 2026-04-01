#!/bin/bash

echo "⚡ Otimizando configuração SSL do Nginx"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Execute como root (sudo)${NC}"
    exit 1
fi

NGINX_CONFIG="/etc/nginx/sites-available/central-rnc"

if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${RED}❌ Arquivo de configuração não encontrado: $NGINX_CONFIG${NC}"
    exit 1
fi

echo -e "${YELLOW}Fazendo backup da configuração atual...${NC}"
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}Verificando configuração atual...${NC}"

# Verificar se já tem configuração SSL
if grep -q "listen 443" "$NGINX_CONFIG"; then
    echo -e "${GREEN}✅ SSL já configurado${NC}"
else
    echo -e "${RED}❌ SSL não encontrado na configuração${NC}"
    echo "   Execute primeiro: sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br"
    exit 1
fi

echo ""
echo -e "${YELLOW}Otimizações que serão aplicadas:${NC}"
echo "1. ✅ Habilitar HTTP/2"
echo "2. ✅ Otimizar protocolos TLS (desabilitar versões antigas)"
echo "3. ✅ Configurar cipher suites seguros e rápidos"
echo "4. ✅ Habilitar OCSP Stapling"
echo "5. ✅ Configurar SSL session cache"
echo "6. ✅ Otimizar keepalive"
echo "7. ✅ Habilitar compressão gzip"
echo "8. ✅ Otimizar timeouts"
echo ""

read -p "Continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Cancelado."
    exit 0
fi

# Criar configuração otimizada
cat > /tmp/nginx-ssl-optimized.conf << 'EOF'
# Configuração SSL Otimizada
# Adicione estas diretivas no bloco server {} do seu site

# Habilitar HTTP/2 (já deve estar se o Certbot configurou)
# listen 443 ssl http2;

# Otimizações SSL/TLS
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
ssl_ecdh_curve secp384r1;

# OCSP Stapling (melhora performance e privacidade)
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/central-rnc.com.br/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# SSL Session Cache (reduz handshakes)
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# Otimizações de Performance
keepalive_timeout 65;
keepalive_requests 100;
sendfile on;
tcp_nopush on;
tcp_nodelay on;

# Compressão
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
gzip_disable "msie6";

# Buffer sizes
client_body_buffer_size 128k;
client_max_body_size 50M;
client_header_buffer_size 1k;
large_client_header_buffers 4 16k;

# Timeouts
client_body_timeout 12;
client_header_timeout 12;
send_timeout 10;
EOF

echo -e "${YELLOW}Configuração otimizada criada em: /tmp/nginx-ssl-optimized.conf${NC}"
echo ""
echo "📝 Próximos passos:"
echo "1. Abra o arquivo de configuração: sudo nano $NGINX_CONFIG"
echo "2. Adicione as diretivas do arquivo /tmp/nginx-ssl-optimized.conf"
echo "3. Coloque as diretivas SSL dentro do bloco 'server {}' que tem 'listen 443'"
echo "4. Teste: sudo nginx -t"
echo "5. Recarregue: sudo systemctl reload nginx"
echo ""
echo "Ou execute este script novamente com --auto para aplicar automaticamente:"
echo "sudo ./otimizar-ssl-nginx.sh --auto"

# Se --auto foi passado, aplicar automaticamente
if [ "$1" == "--auto" ]; then
    echo ""
    echo -e "${YELLOW}Aplicando otimizações automaticamente...${NC}"
    
    # Ler configuração atual
    CONFIG_CONTENT=$(cat "$NGINX_CONFIG")
    
    # Verificar se já tem as otimizações
    if echo "$CONFIG_CONTENT" | grep -q "ssl_session_cache"; then
        echo -e "${YELLOW}⚠️  Otimizações já parecem estar aplicadas${NC}"
        read -p "Aplicar mesmo assim? (s/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            exit 0
        fi
    fi
    
    # Criar script Python para inserir as otimizações
    python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/central-rnc"

with open(config_file, 'r') as f:
    content = f.read()

# Verificar se já tem listen 443
if "listen 443" not in content:
    print("❌ SSL não configurado. Execute certbot primeiro.")
    sys.exit(1)

# Otimizações SSL a adicionar
ssl_optimizations = """
    # Otimizações SSL/TLS
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_ecdh_curve secp384r1;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/central-rnc.com.br/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # SSL Session Cache
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # Performance
    keepalive_timeout 65;
    keepalive_requests 100;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Compressão
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";

    # Buffer sizes
    client_body_buffer_size 128k;
    client_max_body_size 50M;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;

    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
"""

# Encontrar o bloco server com listen 443
pattern = r'(server\s*\{[^}]*listen\s+443[^}]*\{)'
match = re.search(pattern, content, re.DOTALL)

if not match:
    # Tentar padrão mais simples
    pattern = r'(server\s*\{[^}]*listen\s+443[^}]*\n)'
    match = re.search(pattern, content)
    
    if match:
        # Inserir após a linha listen 443
        insert_pos = content.find('listen 443')
        if insert_pos != -1:
            # Encontrar próxima linha
            next_line = content.find('\n', insert_pos)
            if next_line != -1:
                new_content = content[:next_line+1] + ssl_optimizations + content[next_line+1:]
                with open(config_file, 'w') as f:
                    f.write(new_content)
                print("✅ Otimizações aplicadas!")
            else:
                print("❌ Erro ao encontrar posição de inserção")
                sys.exit(1)
        else:
            print("❌ Erro ao encontrar listen 443")
            sys.exit(1)
    else:
        print("❌ Não foi possível encontrar o bloco server com SSL")
        print("   Aplique as otimizações manualmente")
        sys.exit(1)
else:
    print("✅ Otimizações já podem estar aplicadas ou formato diferente")
    print("   Verifique manualmente ou aplique as otimizações do arquivo /tmp/nginx-ssl-optimized.conf")

PYTHON_SCRIPT

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${YELLOW}Testando configuração...${NC}"
        if nginx -t; then
            echo -e "${GREEN}✅ Configuração válida!${NC}"
            echo -e "${YELLOW}Recarregando Nginx...${NC}"
            systemctl reload nginx
            echo -e "${GREEN}✅ Nginx recarregado com sucesso!${NC}"
        else
            echo -e "${RED}❌ Erro na configuração!${NC}"
            echo "   Restaurando backup..."
            cp "${NGINX_CONFIG}.backup."* "$NGINX_CONFIG" 2>/dev/null || echo "   Restaure manualmente do backup"
            exit 1
        fi
    fi
fi

echo ""
echo -e "${GREEN}✅ Concluído!${NC}"


