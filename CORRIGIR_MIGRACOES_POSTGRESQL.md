# 🔧 Corrigir Migrações: SQLite → PostgreSQL

Quando você muda de SQLite para PostgreSQL, as migrações antigas não são compatíveis. Siga estes passos para corrigir.

## ⚠️ Problema

As migrações em `prisma/migrations/` foram criadas para SQLite, mas agora estamos usando PostgreSQL. O Prisma não permite usar migrações de um provider diferente.

## ✅ Solução: Usar `prisma db push` (Recomendado para Produção)

O `prisma db push` sincroniza o schema diretamente com o banco, sem precisar de migrações. É ideal para produção quando você muda de provider.

### Passo 1: Remover migrações antigas

```bash
cd ~/app

# Fazer backup (opcional)
cp -r prisma/migrations prisma/migrations.backup

# Remover migrações antigas
rm -rf prisma/migrations
```

### Passo 2: Garantir que o schema está configurado para PostgreSQL

```bash
# Verificar schema
cat prisma/schema.prisma | grep -A 2 "datasource db"

# Deve mostrar:
# datasource db {
#   provider = "postgresql"
#   url      = env("DATABASE_URL")
# }
```

Se não estiver correto:

```bash
# Copiar schema de produção
cp prisma/schema.production.prisma prisma/schema.prisma
```

### Passo 3: Sincronizar schema com o banco

```bash
# Gerar Prisma Client
npx prisma generate

# Sincronizar schema com banco (cria todas as tabelas)
npx prisma db push

# Confirmar quando perguntado (digite 'y' ou 'yes')
```

### Passo 4: (Opcional) Criar novas migrações para o futuro

Se quiser criar migrações para futuras alterações:

```bash
# Criar migração inicial
npx prisma migrate dev --name init_postgresql

# Isso criará uma nova pasta migrations/ com migrações para PostgreSQL
```

## 🔄 Alternativa: Recriar Migrações do Zero

Se preferir manter o histórico de migrações:

```bash
cd ~/app

# 1. Remover migrações antigas
rm -rf prisma/migrations

# 2. Garantir schema PostgreSQL
cp prisma/schema.production.prisma prisma/schema.prisma

# 3. Gerar Prisma Client
npx prisma generate

# 4. Criar migração inicial para PostgreSQL
npx prisma migrate dev --name init_postgresql

# 5. Aplicar migração
npx prisma migrate deploy
```

## ⚠️ ATENÇÃO: Dados Existentes

- Se você já tiver dados no banco SQLite local, eles **não serão migrados automaticamente**
- Você precisará exportar dados do SQLite e importar no PostgreSQL manualmente
- Para um novo deploy em produção, isso geralmente não é problema

## ✅ Verificação

Depois de executar `prisma db push`:

```bash
# Verificar se as tabelas foram criadas
psql -U central_rnc_user -d central_rnc -h localhost -c "\dt"

# OU via Prisma Studio (opcional)
npx prisma studio
# Acesse http://localhost:5555 no navegador
```

## 🎯 Resumo Rápido

```bash
cd ~/app

# 1. Remover migrações antigas
rm -rf prisma/migrations

# 2. Garantir schema PostgreSQL
cp prisma/schema.production.prisma prisma/schema.prisma

# 3. Gerar e sincronizar
npx prisma generate
npx prisma db push

# 4. (Opcional) Popular banco
npm run seed
```

---

**💡 Dica:** Para produção, `prisma db push` é mais simples e direto. Use `prisma migrate` apenas se precisar de controle fino sobre o histórico de migrações.


