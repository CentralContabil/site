# 🔧 Corrigir proxy_pass para Manter /api

O problema é que `proxy_pass http://localhost:3006;` remove o `/api` do caminho. Precisamos manter o `/api`.

## ✅ Solução: Adicionar /api no proxy_pass

Execute na VPS:

```bash
sudo nano /etc/nginx/sites-available/central-rnc
```

Altere a linha do `proxy_pass` de:
```nginx
proxy_pass http://localhost:3006;
```

Para:
```nginx
proxy_pass http://localhost:3006/api;
```

A configuração completa deve ficar assim:

```nginx
    # CRÍTICO: API Backend DEVE vir ANTES de location /
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

## 🔄 Depois de Atualizar

```bash
# Testar configuração
sudo nginx -t

# Se OK, recarregar
sudo systemctl reload nginx

# Testar API
curl http://central-rnc.com.br/api/health
curl http://central-rnc.com.br/api/configurations
curl http://central-rnc.com.br/api/services
```

## 🔍 Explicação

Quando você acessa `/api/health`:
- Com `proxy_pass http://localhost:3006;` → Nginx envia para `http://localhost:3006/health` ❌
- Com `proxy_pass http://localhost:3006/api;` → Nginx envia para `http://localhost:3006/api/health` ✅

---

**💡 Dica:** Se ainda não funcionar, verifique se a API está respondendo:
```bash
curl http://localhost:3006/api/health
```


