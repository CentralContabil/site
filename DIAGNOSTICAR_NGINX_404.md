# 🔍 Diagnosticar 404 do Nginx

O problema persiste. Vamos verificar se o Nginx está usando a configuração correta.

## 🔍 Verificações

Execute na VPS:

```bash
# 1. Verificar se o link simbólico existe
ls -la /etc/nginx/sites-enabled/ | grep central-rnc

# 2. Verificar qual configuração está realmente ativa
sudo nginx -T | grep -A 30 "server_name central-rnc"

# 3. Verificar se há outras configurações conflitantes
sudo ls -la /etc/nginx/sites-enabled/

# 4. Verificar logs do Nginx em tempo real
sudo tail -f /var/log/nginx/central-rnc-error.log
# (em outro terminal, execute: curl http://central-rnc.com.br/api/health)

# 5. Verificar se há configuração padrão interferindo
sudo cat /etc/nginx/sites-enabled/default 2>/dev/null | grep -A 5 "location /api"
```

## ✅ Possíveis Soluções

### Solução 1: Remover configuração padrão (se existir)

```bash
# Desabilitar site padrão se estiver interferindo
sudo rm /etc/nginx/sites-enabled/default

# Recarregar Nginx
sudo systemctl reload nginx
```

### Solução 2: Verificar se o link simbólico está correto

```bash
# Verificar link
ls -la /etc/nginx/sites-enabled/central-rnc

# Se não existir, criar
sudo ln -s /etc/nginx/sites-available/central-rnc /etc/nginx/sites-enabled/central-rnc

# Recarregar
sudo systemctl reload nginx
```

### Solução 3: Testar com proxy_pass sem /api

Se adicionar `/api` não funcionou, tente sem (mas com rewrite):

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

### Solução 4: Verificar se há problema com o server_name

```bash
# Testar com IP diretamente
curl -H "Host: central-rnc.com.br" http://127.0.0.1/api/health

# Verificar se o server_name está correto
sudo cat /etc/nginx/sites-available/central-rnc | grep server_name
```

---

**💡 Dica:** Execute todas as verificações acima e me envie os resultados.


