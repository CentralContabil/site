# 🔍 Diagnosticar API que Não Carrega Dados do Banco

## 🔍 Passo 1: Verificar se a API está rodando

Execute na VPS:

```bash
# Verificar status do PM2
pm2 status

# Ver logs da API
pm2 logs central-rnc --lines 50

# Verificar se a porta 3006 está em uso
netstat -tlnp | grep 3006
# ou
ss -tlnp | grep 3006
```

## 🔍 Passo 2: Verificar Conexão com Banco de Dados

```bash
cd ~/app

# Verificar se o .env tem DATABASE_URL
cat .env | grep DATABASE_URL

# Deve mostrar algo como:
# DATABASE_URL="postgresql://central_rnc_user:Pkg%40%40gUI4557@localhost:5432/central_rnc?schema=public"

# Testar conexão direta com PostgreSQL
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT COUNT(*) FROM slides;"
```

## 🔍 Passo 3: Verificar Prisma Client

```bash
cd ~/app

# Verificar se o Prisma Client foi gerado
ls -la node_modules/@prisma/client/

# Regenerar Prisma Client (se necessário)
npx prisma generate

# Verificar schema
cat prisma/schema.prisma | grep -A 3 "datasource db"
# Deve mostrar: provider = "postgresql"
```

## 🔍 Passo 4: Testar API Diretamente

```bash
# Testar endpoint de configuração
curl http://localhost:3006/api/configuracoes

# Testar endpoint de slides
curl http://localhost:3006/api/slides

# Testar endpoint de serviços
curl http://localhost:3006/api/servicos
```

## 🔍 Passo 5: Verificar Logs de Erro

```bash
# Logs do PM2
pm2 logs central-rnc --err --lines 100

# Logs do sistema
sudo journalctl -u pm2-root -n 50

# Verificar se há erros de conexão
pm2 logs central-rnc | grep -i "error\|prisma\|database\|connection"
```

## 🔍 Passo 6: Verificar Nginx (Proxy)

```bash
# Verificar configuração do Nginx
sudo cat /etc/nginx/sites-available/central-rnc | grep -A 10 "location /api"

# Testar proxy do Nginx
curl http://central-rnc.com.br/api/configuracoes

# Ver logs do Nginx
sudo tail -50 /var/log/nginx/central-rnc-error.log
```

## ✅ Soluções Comuns

### Problema 1: API não está rodando

```bash
# Reiniciar PM2
pm2 restart central-rnc

# Ou iniciar novamente
cd ~/app
pm2 start ecosystem.config.cjs
pm2 save
```

### Problema 2: Prisma Client não gerado

```bash
cd ~/app
npx prisma generate
pm2 restart central-rnc
```

### Problema 3: DATABASE_URL incorreta

```bash
cd ~/app
nano .env
# Verificar se DATABASE_URL está correta
# Deve ser: postgresql://central_rnc_user:Pkg%40%40gUI4557@localhost:5432/central_rnc?schema=public

# Recarregar variáveis de ambiente
pm2 restart central-rnc
```

### Problema 4: Schema Prisma incorreto

```bash
cd ~/app

# Verificar se está usando PostgreSQL
cat prisma/schema.prisma | grep provider

# Se mostrar "sqlite", corrigir:
cp prisma/schema.production.prisma prisma/schema.prisma
npx prisma generate
pm2 restart central-rnc
```

### Problema 5: Banco de dados vazio

```bash
cd ~/app

# Verificar se há dados
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT COUNT(*) FROM slides;"

# Se retornar 0, executar seed
npm run seed
```

---

**💡 Dica:** Execute os passos de diagnóstico na ordem e me envie os resultados para identificar o problema específico.


