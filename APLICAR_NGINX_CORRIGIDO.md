# 🔧 Aplicar Configuração Corrigida do Nginx

O problema é que `location /api` está DEPOIS de `location /` no Nginx. A ordem importa!

## ✅ Solução: Reordenar Regras do Nginx

Execute na VPS:

```bash
# 1. Fazer backup da configuração atual
sudo cp /etc/nginx/sites-available/central-rnc /etc/nginx/sites-available/central-rnc.backup

# 2. Editar configuração
sudo nano /etc/nginx/sites-available/central-rnc
```

**IMPORTANTE:** A regra `location /api` DEVE vir ANTES de `location /`!

Cole esta configuração (ou apenas reordene as regras):

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
# 3. Testar configuração
sudo nginx -t

# 4. Se OK, recarregar
sudo systemctl reload nginx

# 5. Testar API
curl http://central-rnc.com.br/api/health
curl http://central-rnc.com.br/api/configurations
curl http://central-rnc.com.br/api/services
curl http://central-rnc.com.br/api/slides
```

## 🔍 Verificar Ordem Atual

Para verificar a ordem atual:

```bash
sudo cat /etc/nginx/sites-available/central-rnc | grep -n "location"
```

A ordem correta deve ser:
1. `location /.well-known` (linha menor)
2. `location /api` (linha menor)
3. `location /uploads` (linha menor)
4. `location /` (linha maior - por último)

---

**💡 Dica:** Se ainda não funcionar, verifique os logs:
```bash
sudo tail -50 /var/log/nginx/central-rnc-error.log
sudo tail -50 /var/log/nginx/central-rnc-access.log | grep "/api"
```


