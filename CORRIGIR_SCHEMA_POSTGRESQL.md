# 🔧 Corrigir Schema Prisma para PostgreSQL

O erro ocorre porque o `prisma/schema.prisma` na VPS ainda está configurado para SQLite, mas o `.env` aponta para PostgreSQL.

## ✅ Solução: Substituir Schema

Execute na VPS:

```bash
cd ~/app

# Fazer backup do schema atual
cp prisma/schema.prisma prisma/schema.sqlite.backup

# Substituir pelo schema de produção (PostgreSQL)
cp prisma/schema.production.prisma prisma/schema.prisma

# Verificar se foi substituído corretamente
grep -A 3 "datasource db" prisma/schema.prisma
```

**Deve mostrar:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🔄 Regenerar Prisma Client

Depois de substituir o schema:

```bash
cd ~/app

# Regenerar Prisma Client para PostgreSQL
npx prisma generate

# Agora tentar db push novamente
npx prisma db push
```

## ✅ Comando Completo (Copie e Cole)

```bash
cd ~/app
cp prisma/schema.prisma prisma/schema.sqlite.backup
cp prisma/schema.production.prisma prisma/schema.prisma
grep -A 3 "datasource db" prisma/schema.prisma
npx prisma generate
npx prisma db push
```

---

**💡 Nota:** Se o arquivo `schema.production.prisma` não existir na VPS, você precisará enviá-lo do seu computador local:

```bash
# Do seu computador (Windows PowerShell)
scp prisma/schema.production.prisma root@72.60.155.69:/root/app/prisma/
```


