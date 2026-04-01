# 🔧 Corrigir API Parada na VPS

## Diagnóstico Rápido

### 1. Verificar Status do PM2

```bash
ssh root@72.60.155.69
# Senha: SUA_SENHA_VPS_AQUI

cd /root/app
pm2 status
```

### 2. Verificar Logs

```bash
pm2 logs central-rnc --lines 50
```

### 3. Testar API Localmente

```bash
curl http://localhost:3006/api/health
```

### 4. Testar API via Nginx

```bash
curl https://central-rnc.com.br/api/health
```

## Correção Rápida

### Opção 1: Script Automático

```bash
# Enviar script para VPS
scp corrigir-api-parada-vps.sh root@72.60.155.69:/root/app/

# Executar na VPS
ssh root@72.60.155.69
cd /root/app
chmod +x corrigir-api-parada-vps.sh
bash corrigir-api-parada-vps.sh
```

### Opção 2: Manual

```bash
ssh root@72.60.155.69
cd /root/app

# 1. Regenerar Prisma Client
npx prisma generate

# 2. Reiniciar PM2
pm2 restart central-rnc
pm2 save

# 3. Verificar status
pm2 status

# 4. Verificar logs
pm2 logs central-rnc --lines 20
```

## Problemas Comuns

### 1. PM2 Parou

```bash
pm2 restart central-rnc
# ou
pm2 start ecosystem.config.cjs --name central-rnc
pm2 save
```

### 2. Erro no Prisma Client

```bash
npx prisma generate
pm2 restart central-rnc
```

### 3. Porta 3006 em Uso por Outro Processo

```bash
# Verificar qual processo está usando
lsof -i :3006

# Matar processo (substitua PID pelo número do processo)
kill -9 PID

# Reiniciar PM2
pm2 restart central-rnc
```

### 4. Erro no .env

```bash
# Verificar se DATABASE_URL está correto
cat .env | grep DATABASE_URL

# Se necessário, editar
nano .env
# Depois reiniciar
pm2 restart central-rnc
```

### 5. Nginx Não Está Proxyando

```bash
# Verificar configuração
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/central-rnc-error.log

# Se necessário, reiniciar Nginx
sudo systemctl restart nginx
```

## Verificar se Funcionou

```bash
# Testar localmente
curl http://localhost:3006/api/health

# Testar via Nginx
curl https://central-rnc.com.br/api/health

# Verificar no navegador
# Acesse: https://central-rnc.com.br/api/health
```

## Se Nada Funcionar

1. **Ver logs completos:**
```bash
pm2 logs central-rnc --lines 100
```

2. **Verificar se há erros no código:**
```bash
cd /root/app
node -e "require('./api/server.ts')" 2>&1
```

3. **Reiniciar tudo:**
```bash
pm2 stop central-rnc
pm2 delete central-rnc
pm2 start ecosystem.config.cjs --name central-rnc
pm2 save
```
