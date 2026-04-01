# 🔧 Corrigir Nginx para API

O problema é que o Nginx está retornando 404 para `/api/*`. A configuração precisa ter a regra `/api` ANTES da regra `/`.

## ✅ Solução: Atualizar Configuração do Nginx

Execute na VPS:

```bash
sudo nano /etc/nginx/sites-available/central-rnc
```

**IMPORTANTE:** A regra `location /api` DEVE vir ANTES de `location /`!

Cole esta configuração completa:

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

    # CRÍTICO: API Backend DEVE vir ANTES de location /
    location /api {
        proxy_pass http://localhost:3006;
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

    # Uploads (arquivos enviados)
    location /uploads {
        alias /root/app/public/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Frontend (arquivos estáticos) - DEVE vir DEPOIS de /api
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

# Se OK, recarregar
sudo systemctl reload nginx

# Testar novamente
curl http://central-rnc.com.br/api/health
curl http://central-rnc.com.br/api/configurations
curl http://central-rnc.com.br/api/services
```

## 🔍 Verificar Ordem das Regras

A ordem é CRÍTICA no Nginx:
1. `.well-known` (para Certbot)
2. `/api` (API - DEVE vir antes de `/`)
3. `/uploads` (uploads)
4. `/` (frontend - DEVE vir por último)

---

**💡 Dica:** Se ainda não funcionar, verifique os logs:
```bash
sudo tail -50 /var/log/nginx/central-rnc-error.log
```


