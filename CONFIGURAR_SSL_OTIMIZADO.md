# 🔒 Configurar SSL Otimizado para central-rnc.com.br

## Problema: Site lento após SSL

Após configurar SSL, o site pode ficar lento por vários motivos:
1. ❌ Falta de HTTP/2
2. ❌ Protocolos TLS antigos e inseguros
3. ❌ Falta de OCSP Stapling
4. ❌ SSL Session Cache não configurado
5. ❌ Compressão não habilitada
6. ❌ Keepalive não otimizado

## 🚀 Solução: Otimizar SSL

### Passo 1: Enviar script de otimização

```powershell
scp otimizar-ssl-nginx.sh root@72.60.155.69:/root/app/
```

### Passo 2: Na VPS, executar o script

```bash
cd ~/app
chmod +x otimizar-ssl-nginx.sh
sudo ./otimizar-ssl-nginx.sh --auto
```

### Passo 3: Verificar se funcionou

```bash
# Testar configuração
sudo nginx -t

# Ver status
sudo systemctl status nginx

# Testar site
curl -I https://central-rnc.com.br
```

## 📝 Configuração Manual (se o script não funcionar)

Se preferir aplicar manualmente, edite o arquivo:

```bash
sudo nano /etc/nginx/sites-available/central-rnc
```

Adicione estas diretivas **dentro do bloco `server {}` que tem `listen 443`**:

```nginx
server {
    listen 443 ssl http2;  # Certifique-se de que tem http2
    server_name central-rnc.com.br www.central-rnc.com.br;

    # ... certificados SSL (já configurados pelo Certbot) ...

    # ⚡ OTIMIZAÇÕES SSL/TLS
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

    # SSL Session Cache (reduz handshakes SSL)
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # ⚡ OTIMIZAÇÕES DE PERFORMANCE
    keepalive_timeout 65;
    keepalive_requests 100;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Compressão (reduz tamanho das respostas)
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

    # ... resto da configuração ...
}
```

### Depois de editar:

```bash
# Testar configuração
sudo nginx -t

# Se OK, recarregar
sudo systemctl reload nginx
```

## 🧪 Testar Performance

### 1. Verificar HTTP/2

```bash
curl -I --http2 https://central-rnc.com.br
```

Deve mostrar `HTTP/2 200`

### 2. Verificar OCSP Stapling

```bash
echo | openssl s_client -connect central-rnc.com.br:443 -status 2>/dev/null | grep -i "OCSP"
```

Deve mostrar `OCSP Response Status: successful`

### 3. Verificar TLS 1.3

```bash
openssl s_client -connect central-rnc.com.br:443 -tls1_3 < /dev/null 2>/dev/null | grep "Protocol"
```

### 4. Testar velocidade

Use ferramentas online:
- https://www.ssllabs.com/ssltest/analyze.html?d=central-rnc.com.br
- https://tools.pingdom.com/
- https://gtmetrix.com/

## 📊 O que cada otimização faz:

1. **HTTP/2**: Reduz latência, permite multiplexing
2. **TLS 1.3**: Mais rápido e seguro que TLS 1.2
3. **OCSP Stapling**: Evita consultas externas durante handshake
4. **SSL Session Cache**: Reutiliza sessões SSL, evita handshakes repetidos
5. **Gzip**: Comprime respostas, reduz tráfego
6. **Keepalive**: Reutiliza conexões TCP
7. **Sendfile**: Otimiza transferência de arquivos

## ⚠️ Problemas Comuns

### Erro: "ssl_trusted_certificate" não encontrado

```bash
# Verificar se o arquivo existe
ls -la /etc/letsencrypt/live/central-rnc.com.br/

# Se não existir, pode remover essa linha ou gerar:
sudo certbot certificates
```

### Site ainda lento

1. Verificar se HTTP/2 está ativo
2. Verificar logs do Nginx: `sudo tail -f /var/log/nginx/central-rnc-error.log`
3. Verificar recursos do servidor: `htop` ou `top`
4. Verificar se há muitos requests simultâneos

### OCSP Stapling não funciona

Se der erro, pode comentar essas linhas temporariamente:
```nginx
# ssl_stapling on;
# ssl_stapling_verify on;
```


