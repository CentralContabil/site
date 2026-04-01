# 🔧 Configuração Final do Nginx para API

Use esta configuração que funciona de forma mais confiável:

## ✅ Configuração Correta

Execute na VPS:

```bash
sudo nano /etc/nginx/sites-available/central-rnc
```

Use esta configuração completa:

```nginx
server {
    listen 80;
    server_name central-rnc.com.br www.central-rnc.com.br;

    # Logs
    access_log /var/log/nginx/central-rnc-access.log;
    error_log /var/log/nginx/central-rnc-error.log;

    # Tamanho máximo de upload
    client_max_body_size 50M;

    # Permitir acesso ao .well-known para Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
        default_type "text/plain";
    }

    # API Backend - usar /api/ (com barra) e proxy_pass com barra
    location /api/ {
        proxy_pass http://localhost:3006/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploads
    location /uploads {
        alias /root/app/public/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Frontend
    location / {
        root /var/www/central-rnc;
        try_files $uri $uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 🔄 Depois de Atualizar

```bash
# Testar configuração
sudo nginx -t

# Se OK, recarregar (ou reiniciar se necessário)
sudo systemctl reload nginx
# OU se reload não funcionar:
sudo systemctl restart nginx

# Testar API
curl http://central-rnc.com.br/api/health
curl http://central-rnc.com.br/api/configurations
```

## 🔍 Se Ainda Não Funcionar

Execute este diagnóstico completo:

```bash
# Enviar script de diagnóstico
# (do seu computador)
scp verificar-nginx-completo.sh root@72.60.155.69:/root/app/

# Na VPS
cd ~/app
chmod +x verificar-nginx-completo.sh
bash verificar-nginx-completo.sh
```

---

**💡 Dica:** A diferença é usar `location /api/` (com barra) e `proxy_pass http://localhost:3006/api/;` (com barra). Isso faz o Nginx tratar corretamente o caminho.


