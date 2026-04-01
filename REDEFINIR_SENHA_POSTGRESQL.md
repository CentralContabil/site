# 🔐 Como Redefinir Senha do PostgreSQL

Este guia mostra como alterar a senha do usuário PostgreSQL para evitar problemas com caracteres especiais na URL de conexão.

## 📋 Passo a Passo

### 1. Conectar ao PostgreSQL como superusuário

```bash
# Entrar como usuário postgres
sudo -u postgres psql
```

### 2. Alterar a senha do usuário

No prompt do PostgreSQL (`postgres=#`), execute:

```sql
-- Alterar senha do usuário central_rnc_user
ALTER USER central_rnc_user WITH PASSWORD 'CentralRnc2024Segura';
```

**⚠️ IMPORTANTE:** Escolha uma senha forte mas sem caracteres especiais que precisem ser codificados na URL:
- ✅ Use letras maiúsculas e minúsculas
- ✅ Use números
- ✅ Evite: `!`, `@`, `#`, `$`, `%`, `&`, `*`, etc.

**Exemplos de senhas boas:**
- `CentralRnc2024Segura`
- `CentralRnc2024DB`
- `CentralRnc2024Postgres`

### 3. Verificar se a alteração foi aplicada

```sql
-- Listar usuários e verificar
\du central_rnc_user
```

### 4. Sair do PostgreSQL

```sql
\q
```

### 5. Atualizar o arquivo .env

```bash
cd ~/app
nano .env
```

Atualize a linha `DATABASE_URL` com a nova senha:

```env
# Nova senha (sem caracteres especiais)
DATABASE_URL="postgresql://central_rnc_user:CentralRnc2024Segura@localhost:5432/central_rnc?schema=public"
```

**⚠️ IMPORTANTE:** Se a senha ainda tiver caracteres especiais, codifique-os:
- `!` = `%21`
- `@` = `%40`
- `#` = `%23`
- `$` = `%24`
- `%` = `%25`
- `&` = `%26`

### 6. Testar a conexão

```bash
# Testar conexão com a nova senha
psql -U central_rnc_user -d central_rnc -h localhost
# Digite a nova senha quando solicitado
# Digite \q para sair

# OU testar via Prisma
npx prisma migrate deploy
```

## 🔄 Script Automatizado

Execute este script na VPS para automatizar o processo:

```bash
#!/bin/bash

echo "🔐 Redefinindo senha do PostgreSQL..."
echo ""

# Nova senha (sem caracteres especiais)
NEW_PASSWORD="CentralRnc2024Segura"

# Conectar e alterar senha
sudo -u postgres psql <<EOF
ALTER USER central_rnc_user WITH PASSWORD '$NEW_PASSWORD';
\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ Senha alterada com sucesso!"
    echo ""
    echo "📝 Atualizando .env..."
    
    cd ~/app
    # Fazer backup
    cp .env .env.backup
    
    # Atualizar DATABASE_URL
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://central_rnc_user:$NEW_PASSWORD@localhost:5432/central_rnc?schema=public\"|g" .env
    
    echo "✅ .env atualizado!"
    echo ""
    echo "🔍 Verificando .env:"
    grep DATABASE_URL .env
    echo ""
    echo "🧪 Testando conexão..."
    npx prisma migrate deploy
else
    echo "❌ Erro ao alterar senha"
    exit 1
fi
```

## ✅ Verificação Final

```bash
# Verificar se o usuário foi atualizado
sudo -u postgres psql -c "\du central_rnc_user"

# Testar conexão
psql -U central_rnc_user -d central_rnc -h localhost
# Digite a nova senha

# Testar via Prisma
cd ~/app
npx prisma migrate deploy
```

## 💡 Dica: Gerar Senha Segura Sem Caracteres Especiais

```bash
# Gerar senha aleatória (apenas letras e números)
openssl rand -base64 24 | tr -d "=+/" | cut -c1-20

# OU usar este comando para senha mais simples
openssl rand -hex 16
```

---

**🎯 Resumo:**
1. Conecte ao PostgreSQL: `sudo -u postgres psql`
2. Altere a senha: `ALTER USER central_rnc_user WITH PASSWORD 'NovaSenhaSemEspeciais';`
3. Atualize o `.env` com a nova senha
4. Teste a conexão: `npx prisma migrate deploy`


