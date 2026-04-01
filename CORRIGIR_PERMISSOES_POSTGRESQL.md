# 🔧 Corrigir Permissões PostgreSQL

O erro "permission denied for schema public" indica que o usuário não tem permissões suficientes no schema `public`.

## ✅ Solução: Conceder Permissões

Execute na VPS:

```bash
# Conectar como superusuário postgres
sudo -u postgres psql

# No prompt do PostgreSQL, execute:
```

### Comandos SQL para executar:

```sql
-- Conceder permissões no schema public
GRANT ALL ON SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON DATABASE central_rnc TO central_rnc_user;

-- Conceder permissões em todas as tabelas existentes
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO central_rnc_user;

-- Conceder permissões em tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO central_rnc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO central_rnc_user;

-- Verificar permissões
\dp

-- Sair
\q
```

## 🔄 Script Automatizado

Execute este comando único:

```bash
sudo -u postgres psql <<EOF
GRANT ALL ON SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON DATABASE central_rnc TO central_rnc_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO central_rnc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO central_rnc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO central_rnc_user;
\q
EOF
```

## ✅ Verificação

Depois de conceder as permissões:

```bash
# Testar novamente
cd ~/app
npx prisma db push
```

## 🎯 Comando Completo (Copie e Cole)

```bash
sudo -u postgres psql -c "GRANT ALL ON SCHEMA public TO central_rnc_user;" -c "GRANT ALL PRIVILEGES ON DATABASE central_rnc TO central_rnc_user;" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO central_rnc_user;" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO central_rnc_user;" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO central_rnc_user;" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO central_rnc_user;"

cd ~/app
npx prisma db push
```

---

**💡 Solução Adicional:** Se ainda houver problemas, torne o usuário owner do schema:

```sql
-- Tornar usuário owner do schema public
ALTER SCHEMA public OWNER TO central_rnc_user;

-- OU conceder permissão de criação
GRANT CREATE ON SCHEMA public TO central_rnc_user;
```

**⚠️ IMPORTANTE:** Execute ambos os comandos se o problema persistir.

