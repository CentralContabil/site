# 🔧 Corrigir Erro do Certbot (Nginx 500)

O erro ocorre porque o Nginx não consegue servir os arquivos do Certbot. Vamos diagnosticar e corrigir:

## 🔍 Diagnóstico

Execute na VPS:

```bash
# 1. Verificar se o build foi feito
ls -la ~/app/dist/

# 2. Verificar logs do Nginx
sudo tail -20 /var/log/nginx/central-rnc-error.log

# 3. Verificar se o Nginx está rodando
sudo systemctl status nginx

# 4. Verificar configuração do Nginx
sudo nginx -t

# 5. Verificar se o diretório dist existe e tem permissões
ls -la /root/app/dist/
```

## ✅ Soluções

### Solução 1: Fazer Build do Frontend (Se ainda não foi feito)

```bash
cd ~/app
npm run build

# Verificar se foi criado
ls -la ~/app/dist/
```

### Solução 2: Corrigir Permissões

```bash
# Dar permissões ao Nginx para acessar os arquivos
sudo chown -R www-data:www-data /root/app/dist
sudo chmod -R 755 /root/app/dist

# Ou criar diretório com permissões corretas
sudo mkdir -p /var/www/central-rnc
sudo cp -r /root/app/dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc
```

### Solução 3: Atualizar Configuração do Nginx

Se você usar `/var/www/central-rnc` em vez de `/root/app/dist`, atualize o Nginx:

```bash
sudo nano /etc/nginx/sites-available/central-rnc
```

Altere a linha:
```nginx
root /root/app/dist;
```

Para:
```nginx
root /var/www/central-rnc;
```

Depois:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Solução 4: Configuração Completa do Nginx (Com suporte ao Certbot)

```bash
sudo nano /etc/nginx/sites-available/central-rnc
```

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
    }

    # Frontend (arquivos estáticos)
    location / {
        root /var/www/central-rnc;
        try_files $uri $uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Backend
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
}
```

## 🚀 Passos Completos (Recomendado)

```bash
# 1. Fazer build
cd ~/app
npm run build

# 2. Criar diretório web padrão
sudo mkdir -p /var/www/central-rnc
sudo cp -r /root/app/dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

# 3. Atualizar Nginx (usar configuração acima)
sudo nano /etc/nginx/sites-available/central-rnc

# 4. Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx

# 5. Tentar Certbot novamente
sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
```

## 🧪 Verificar se está funcionando

```bash
# Testar acesso HTTP
curl -I http://central-rnc.com.br

# Verificar logs
sudo tail -f /var/log/nginx/central-rnc-error.log
```

---

**💡 Dica:** Se ainda não funcionar, verifique se o domínio está apontando corretamente para o IP da VPS:

```bash
# Verificar IP da VPS
curl ifconfig.me

# Verificar DNS do domínio
nslookup central-rnc.com.br
```


