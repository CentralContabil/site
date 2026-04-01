# 🔄 Sincronizar Banco de Dados Local para VPS

Este guia mostra como sincronizar os dados do banco de dados local (que tem mais dados) para a VPS.

## 📋 Pré-requisitos

- PostgreSQL rodando localmente
- Acesso SSH à VPS
- Credenciais do banco de dados local e VPS

## 🚀 Método 1: Usando Prisma Studio (Recomendado para poucos dados)

### 1. Exportar dados do banco local

```bash
# No seu computador local
cd C:\Users\wagner\Desktop\PROJETOS\SITE

# Abrir Prisma Studio para visualizar dados
npx prisma studio
```

### 2. Exportar via SQL

Se você tem acesso ao PostgreSQL local:

```bash
# Windows PowerShell
# Exportar dados do SQLite local (se estiver usando SQLite)
# OU exportar do PostgreSQL local

# Se for PostgreSQL local:
pg_dump -U seu_usuario -d nome_do_banco > backup_local.sql
```

## 🚀 Método 2: Usando Script de Exportação/Importação (Recomendado)

### Passo 1: Exportar dados do banco local

Execute no seu computador local:

```bash
cd C:\Users\wagner\Desktop\PROJETOS\SITE
node exportar-dados-local.js
```

Isso criará arquivos JSON com os dados de cada tabela.

### Passo 2: Enviar arquivos para VPS

```powershell
# PowerShell
scp -r dados_exportados/ root@72.60.155.69:/root/app/
```

### Passo 3: Importar na VPS

Na VPS:

```bash
cd ~/app
node importar-dados-vps.js
```

## 🚀 Método 3: Usando pg_dump/pg_restore (PostgreSQL)

### Passo 1: Exportar do banco local

No seu computador local (se for PostgreSQL):

```bash
# Exportar schema + dados
pg_dump -U seu_usuario -d nome_do_banco -F c -f backup_local.dump

# OU exportar apenas dados (sem schema)
pg_dump -U seu_usuario -d nome_do_banco --data-only -F c -f backup_dados.dump
```

### Passo 2: Enviar para VPS

```powershell
scp backup_dados.dump root@72.60.155.69:/root/app/
```

### Passo 3: Importar na VPS

Na VPS:

```bash
cd ~/app
pg_restore -U central_rnc_user -d central_rnc -h localhost backup_dados.dump
```

## 🚀 Método 4: Usando Prisma Migrate (Se houver migrações pendentes)

Se os dados foram adicionados via migrações:

```bash
# Na VPS
cd ~/app
npx prisma migrate deploy
```

## ⚠️ Cuidados Importantes

1. **Backup antes de importar:** Sempre faça backup do banco da VPS antes de importar
2. **Conflitos de ID:** Se houver IDs duplicados, pode ser necessário ajustar
3. **Dados sensíveis:** Verifique se não está sobrescrevendo dados importantes da VPS

## 🔍 Verificar Diferenças

Antes de sincronizar, compare os dados:

```bash
# Local - contar registros
npx prisma studio
# OU
psql -U usuario -d banco -c "SELECT COUNT(*) FROM tabela;"

# VPS - contar registros
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT COUNT(*) FROM tabela;"
```


