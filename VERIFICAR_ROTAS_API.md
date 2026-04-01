# 🔍 Verificar Rotas da API

## 📋 Problema Identificado

O backend tem rotas em **inglês**:
- `/api/services` ✅
- `/api/configurations` ✅

Mas você testou em **português**:
- `/api/servicos` ❌ (não existe)
- `/api/configuracoes` ❌ (não existe)

## ✅ Rotas Corretas do Backend

Execute na VPS para testar:

```bash
# Rotas corretas (em inglês)
curl http://localhost:3006/api/services
curl http://localhost:3006/api/configurations
curl http://localhost:3006/api/slides
curl http://localhost:3006/api/testimonials
```

## 🔍 Verificar Logs do PM2

```bash
# Ver logs completos
pm2 logs central-rnc --lines 100

# Ver apenas erros
pm2 logs central-rnc --err --lines 50

# Ver logs em tempo real
pm2 logs central-rnc
```

## 🔍 Verificar se Frontend está usando rotas corretas

O frontend deve estar chamando as rotas em inglês. Verifique no código:
- `src/services/api.ts` - deve usar `/api/services` e `/api/configurations`

## 🧪 Testar Todas as Rotas

Execute na VPS:

```bash
# Health check
curl http://localhost:3006/api/health

# Slides (funciona)
curl http://localhost:3006/api/slides

# Services (deve funcionar)
curl http://localhost:3006/api/services

# Configurations (deve funcionar)
curl http://localhost:3006/api/configurations

# Testimonials
curl http://localhost:3006/api/testimonials
```

## 🔍 Verificar Erros Específicos

Se `/api/configurations` retornar erro, verifique:

```bash
# Ver resposta completa
curl -v http://localhost:3006/api/configurations

# Ver logs do PM2 em tempo real enquanto testa
pm2 logs central-rnc
# (em outro terminal, execute o curl acima)
```

---

**💡 Dica:** As rotas do backend estão em inglês. O frontend deve estar chamando as rotas corretas, mas pode haver um problema de CORS ou de resposta da API.


