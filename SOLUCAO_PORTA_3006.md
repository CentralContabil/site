# 🔧 Solução: Erro "EADDRINUSE: address already in use :::3006"

## 🚨 Problema

A aplicação está tentando usar a porta 3006, mas ela já está em uso por outro processo.

## ✅ Solução Rápida

Execute estes comandos no servidor (SSH):

```bash
# 1. Parar e remover todas as aplicações PM2
cd ~/apps_nodejs
pm2 stop all
pm2 delete all

# 2. Verificar qual porta a KingHost está fornecendo
env | grep PORT

# 3. Verificar processos usando a porta 3006
lsof -i:3006
# OU (se lsof não estiver disponível)
netstat -tulpn | grep :3006

# 4. Se encontrar processos, matar (substitua PID pelo número)
kill -9 PID

# 5. Recriar aplicação
pm2 start start.sh --name site

# 6. Verificar logs
pm2 logs site --lines 30
```

## 🔍 Verificar Variáveis de Porta da KingHost

A KingHost fornece a porta automaticamente. Execute para ver qual está disponível:

```bash
env | grep PORT
```

**Resultado esperado:**
```
PORT_START=21035
# OU
PORT_SITE=21035
# OU outra variável PORT_*
```

## 📝 O que foi ajustado

1. **`api/server.ts`** - Adicionado logs para mostrar qual porta está sendo usada
2. **`fix-porta.sh`** - Script para verificar e liberar a porta 3006

## ⚠️ Importante

**A aplicação NÃO deve usar a porta 3006 na produção!**

A KingHost fornece a porta automaticamente via:
- `process.env.PORT_START` (se o script for `start.sh`)
- `process.env.PORT_SITE` (se o nome da aplicação for `site`)

O código já está configurado para usar essas variáveis. O problema é que:
1. Há processos antigos usando a porta 3006
2. As variáveis de ambiente da KingHost podem não estar sendo passadas corretamente

## 🎯 Passos Detalhados

### Passo 1: Limpar processos PM2

```bash
pm2 list
pm2 stop all
pm2 delete all
pm2 kill  # Mata o daemon do PM2 (opcional)
```

### Passo 2: Verificar processos na porta 3006

```bash
# Método 1 (recomendado)
lsof -i:3006

# Método 2 (alternativo)
netstat -tulpn | grep :3006

# Método 3 (alternativo)
ss -tulpn | grep :3006
```

### Passo 3: Matar processos (se necessário)

```bash
# Se encontrar PIDs, mate-os:
kill -9 PID1 PID2 PID3

# OU, se for um processo Node.js específico:
pkill -f "node.*3006"
```

### Passo 4: Verificar variáveis de ambiente

```bash
# Ver todas as variáveis PORT_*
env | grep PORT

# Ver variáveis específicas
echo "PORT_START: $PORT_START"
echo "PORT_SITE: $PORT_SITE"
echo "PORT: $PORT"
```

### Passo 5: Recriar aplicação

```bash
cd ~/apps_nodejs
nvm use 22.1.0
pm2 start start.sh --name site
pm2 save
pm2 logs site
```

## 🔍 Debug: Ver qual porta está sendo usada

Após recriar, os logs devem mostrar:

```
🔍 Variáveis de porta disponíveis:
   PORT_START: 21035
   PORT_SITE: não definido
   PORT: não definido
   Porta escolhida: 21035
✅ Server ready on port 21035
```

Se ainda mostrar `Porta escolhida: 3006`, significa que:
- As variáveis `PORT_START` e `PORT_SITE` não estão sendo fornecidas
- Verifique a configuração no painel da KingHost

## 💡 Solução Alternativa: Usar porta diferente no .env

Se a KingHost não estiver fornecendo as variáveis corretamente, você pode definir manualmente no `.env`:

```bash
# Editar .env
nano ~/apps_nodejs/.env

# Adicionar (substitua 21035 pela porta do painel):
PORT=21035
```

**⚠️ Mas o ideal é que a KingHost forneça automaticamente via `PORT_START` ou `PORT_SITE`.**

## ✅ Verificação Final

Após seguir os passos, verifique:

```bash
# 1. Aplicação está rodando
pm2 list
# Deve mostrar "site" com status "online"

# 2. Logs não mostram erro de porta
pm2 logs site --lines 20
# Deve mostrar "Server ready on port XXXX" (não 3006)

# 3. Site acessível
curl http://localhost:PORTA/api/health
# (substitua PORTA pela porta real)
```

---

**🎯 Resumo:** O problema é que há processos antigos usando a porta 3006. Limpe todos os processos PM2, verifique qual porta a KingHost está fornecendo, e recrie a aplicação.


