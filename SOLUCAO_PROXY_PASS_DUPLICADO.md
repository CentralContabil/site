# 🔧 Solução: Proxy Pass Duplicando /api

O problema é que a API já tem `/api` nas rotas, então quando você usa `proxy_pass http://localhost:3006/api;`, o Nginx duplica o `/api`.

## 🔍 Verificação

A API tem rotas como:
- `app.use('/api/auth', authRoutes)`
- `app.use('/api/configurations', configurationRoutes)`

Então quando você acessa `/api/health`, a API espera `/api/health` (com `/api`).

## ✅ Solução: Usar proxy_pass sem /api

Quando você usa `location /api` e `proxy_pass http://localhost:3006;` (sem `/api`), o Nginx:
- Remove o `/api` do caminho
- Envia para `http://localhost:3006/health` (sem `/api`)

Mas a API espera `/api/health`. Então precisamos usar `rewrite` para manter o `/api`:

```nginx
location /api {
    rewrite ^/api/(.*)$ /api/$1 break;
    proxy_pass http://localhost:3006;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

OU, mais simples, usar `proxy_pass` com `/api` mas sem o `break` no rewrite:

```nginx
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
    
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

## 🔄 Testar

```bash
sudo nano /etc/nginx/sites-available/central-rnc
# Aplicar uma das configurações acima
sudo nginx -t
sudo systemctl reload nginx
curl http://central-rnc.com.br/api/health
```


