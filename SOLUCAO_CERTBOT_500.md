# 🔧 Solução: Certbot Erro 500

O erro 500 indica que o Nginx não consegue servir os arquivos do Certbot. Vamos corrigir passo a passo.

## 🔍 Passo 1: Verificar Logs do Nginx

Execute para ver o erro específico:

```bash
sudo tail -50 /var/log/nginx/central-rnc-error.log
```

## ✅ Passo 2: Corrigir Configuração do Nginx

O problema geralmente é que a configuração do `.well-known` não está correta. Atualize:

```bash
sudo nano /etc/nginx/sites-available/central-rnc
```

**IMPORTANTE:** A regra `.well-known` DEVE vir ANTES de `location /` e usar `root` em vez de `alias`:

```nginx
server {
    listen 80;
    server_name central-rnc.com.br www.central-rnc.com.br;

    # Logs
    access_log /var/log/nginx/central-rnc-access.log;
    error_log /var/log/nginx/central-rnc-error.log;

    # Tamanho máximo de upload
    client_max_body_size 50M;

    # CRÍTICO: Esta regra DEVE vir ANTES de location /
    # E usar root, não alias
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
        default_type "text/plain";
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

## ✅ Passo 3: Criar Diretório e Permissões

```bash
# Criar diretório
sudo mkdir -p /var/www/html/.well-known/acme-challenge

# Dar permissões corretas
sudo chown -R www-data:www-data /var/www/html/.well-known
sudo chmod -R 755 /var/www/html/.well-known

# Testar se consegue escrever (como Certbot fará)
echo "test" | sudo tee /var/www/html/.well-known/acme-challenge/test.txt
sudo chown www-data:www-data /var/www/html/.well-known/acme-challenge/test.txt
```

## ✅ Passo 4: Testar e Recarregar Nginx

```bash
# Testar configuração
sudo nginx -t

# Se OK, recarregar
sudo systemctl reload nginx

# Testar acesso manual
curl http://central-rnc.com.br/.well-known/acme-challenge/test.txt

# Limpar teste
sudo rm /var/www/html/.well-known/acme-challenge/test.txt
```

## ✅ Passo 5: Tentar Certbot Novamente

```bash
sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
```

## 🔄 Alternativa: Usar Certbot em Modo Standalone

Se ainda não funcionar, use o modo standalone (requer parar o Nginx temporariamente):

```bash
# Parar Nginx
sudo systemctl stop nginx

# Obter certificado em modo standalone
sudo certbot certonly --standalone -d central-rnc.com.br -d www.central-rnc.com.br

# Reiniciar Nginx
sudo systemctl start nginx

# Configurar Nginx para usar o certificado
sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
```

## 🧪 Verificar DNS

Certifique-se de que o domínio está apontando para o IP correto:

```bash
# Ver IP da VPS
curl ifconfig.me

# Verificar DNS
nslookup central-rnc.com.br
nslookup www.central-rnc.com.br
```

---

**💡 Dica:** Se o problema persistir, verifique se há firewall bloqueando a porta 80:

```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```


