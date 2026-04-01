# 🔧 Corrigir proxy_pass do Nginx

O problema pode ser que o `proxy_pass` precisa incluir o caminho `/api` ou usar uma configuração diferente.

## 🔍 Verificar Configuração Atual

Execute na VPS:

```bash
# Ver configuração completa
sudo cat /etc/nginx/sites-available/central-rnc

# Verificar se o proxy_pass está correto
sudo cat /etc/nginx/sites-available/central-rnc | grep -A 10 "location /api"
```

## ✅ Solução: Corrigir proxy_pass

O problema pode ser que o `proxy_pass` precisa manter o `/api` no caminho. Tente uma destas opções:

### Opção 1: Manter /api no proxy_pass

```nginx
location /api {
    proxy_pass http://localhost:3006/api;
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
```

### Opção 2: Usar rewrite (se Opção 1 não funcionar)

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
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

## 🔍 Verificar se API está Respondendo

```bash
# Testar API diretamente (sem Nginx)
curl http://localhost:3006/api/health
curl http://localhost:3006/api/configurations

# Se funcionar, o problema é no Nginx
# Se não funcionar, o problema é na API
```

## 🔍 Verificar Logs do Nginx

```bash
# Ver logs de erro
sudo tail -50 /var/log/nginx/central-rnc-error.log

# Ver logs de acesso
sudo tail -50 /var/log/nginx/central-rnc-access.log | grep "/api"
```

## 🔍 Verificar se Nginx está Usando a Configuração Correta

```bash
# Verificar se o link simbólico existe
ls -la /etc/nginx/sites-enabled/ | grep central-rnc

# Verificar qual configuração está ativa
sudo nginx -T | grep -A 20 "server_name central-rnc"
```

---

**💡 Dica:** Se nada funcionar, tente testar com `curl -v` para ver os headers completos:
```bash
curl -v http://central-rnc.com.br/api/health
```


