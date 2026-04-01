# 🚀 Deploy na KingHost - Guia Completo

Este guia é para fazer deploy usando a aplicação Node.js criada no painel da KingHost.

---

## 📍 ESTRUTURA DE DIRETÓRIOS

**⚠️ IMPORTANTE: Todos os arquivos serão enviados diretamente para `~/apps_nodejs/` (raiz)!**

**Diretório de destino:**
- `/home/central-rnc/apps_nodejs/` ✅ **ENVIE TUDO AQUI**

**⚠️ IMPORTANTE:** 
- O campo "Caminho da Aplicação" no painel (ex: `/site`) é o **caminho web de acesso**, não o diretório físico!
- O **diretório físico** onde você envia os arquivos é: `/home/central-rnc/apps_nodejs/` (raiz)
- **NÃO crie subpastas** - tudo vai direto na raiz de `apps_nodejs/`

### Verificar/Criar Diretório

**Via SSH:**
```bash
# Verificar se o diretório existe
ls -la ~/apps_nodejs/

# Se não existir, criar
mkdir -p ~/apps_nodejs/

# Verificar se foi criado
ls -la ~/apps_nodejs/
```

**Resumo:**
- ✅ **ENVIE TUDO para:** `~/apps_nodejs/` (raiz, sem subpastas)
- ❌ **NÃO crie subpastas** como `site/` - tudo vai direto na raiz

---

## 📤 PASSO 1: Criar Diretório e Fazer Upload

### 1.1. Verificar/Criar Diretório da Aplicação

**Via SSH:**
```bash
# Verificar se o diretório existe
ls -la ~/apps_nodejs/

# Se não existir, criar
mkdir -p ~/apps_nodejs/

# Verificar se foi criado
ls -la ~/apps_nodejs/
```

### 1.2. Fazer Upload dos Arquivos via FTP

**⚠️ ATENÇÃO: Conecte-se via FTP e navegue até: `~/apps_nodejs/` (raiz)**

**Caminho correto no FTP:** 
- `/home/central-rnc/apps_nodejs/` ✅
- Ou: `~/apps_nodejs/` ✅

**⚠️ IMPORTANTE:**
- O campo "Caminho da Aplicação" no painel (ex: `/site`) é apenas o **caminho web de acesso**
- O **diretório físico** onde você envia os arquivos é: `/home/central-rnc/apps_nodejs/` (raiz)
- **NÃO use `public_html` ou `www`** - esses são para sites estáticos/PHP!
- **NÃO crie subpastas** - envie tudo direto na raiz de `apps_nodejs/`

### Onde colocar cada arquivo/pasta:

```
~/apps_nodejs/
│
├── api/                    ← Upload da pasta COMPLETA api/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── app.ts
│   ├── server.ts
│   └── ...
│
├── prisma/                 ← Upload da pasta COMPLETA prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── ...
│
├── public/                 ← Upload da pasta COMPLETA public/
│   ├── uploads/
│   ├── favicon.svg
│   └── ...
│
├── dist/                   ← Upload da pasta COMPLETA dist/ (build do frontend)
│   ├── index.html
│   ├── assets/
│   └── ...
│
├── package.json            ← Upload do arquivo
├── package-lock.json       ← Upload do arquivo
├── main.js                 ← Upload do arquivo (ponto de entrada)
├── tsconfig.json           ← Upload do arquivo
├── vite.config.ts          ← Upload do arquivo
├── tailwind.config.js      ← Upload do arquivo
├── postcss.config.js        ← Upload do arquivo
└── index.html              ← Upload do arquivo
```

---

## 📋 CHECKLIST DE ARQUIVOS PARA UPLOAD

### ✅ Pastas (4):
- [ ] `api/` → `~/apps_nodejs/api/`
- [ ] `prisma/` → `~/apps_nodejs/prisma/`
- [ ] `public/` → `~/apps_nodejs/public/`
- [ ] `dist/` → `~/apps_nodejs/dist/` (gerar com `npm run build` antes)

### ✅ Arquivos (8):
- [ ] `package.json` → `~/apps_nodejs/package.json`
- [ ] `package-lock.json` → `~/apps_nodejs/package-lock.json`
- [ ] `main.js` → `~/apps_nodejs/main.js`
- [ ] `tsconfig.json` → `~/apps_nodejs/tsconfig.json`
- [ ] `vite.config.ts` → `~/apps_nodejs/vite.config.ts`
- [ ] `tailwind.config.js` → `~/apps_nodejs/tailwind.config.js`
- [ ] `postcss.config.js` → `~/apps_nodejs/postcss.config.js`
- [ ] `index.html` → `~/apps_nodejs/index.html`

### ❌ NÃO enviar:
- `node_modules/` (será instalado no servidor)
- `.env` (será criado no servidor)
- `.git/`
- Arquivos de log

---

## 🔧 PASSO 2: Configurar no Servidor (via SSH)

### 2.1. Navegar até o diretório da aplicação

```bash
cd ~/apps_nodejs
ls -la  # Verificar se todos os arquivos foram enviados
```

### 2.2. Selecionar versão do Node.js

```bash
# Listar versões disponíveis
nvm ls

# Selecionar Node.js 22 (ou a versão configurada no painel)
nvm use 22.1.0

# Verificar versão
node --version
```

### 2.3. Instalar dependências

```bash
# Certificar que está no diretório correto
cd ~/apps_nodejs

# Instalar dependências
npm install

# Aguardar conclusão
```

---

## 🗄️ PASSO 3: Configurar Banco de Dados MySQL

### 3.1. Editar schema.prisma para usar MySQL

```bash
cd ~/apps_nodejs
nano prisma/schema.prisma
```

**Localize a seção `datasource db` e altere:**

**DE:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**PARA:**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**Salvar:** `Ctrl+X`, depois `Y`, depois `Enter`

### 3.2. Criar arquivo .env

```bash
nano .env
```

**Cole o seguinte (com suas credenciais MySQL):**

```env
# Banco de Dados MySQL
# MySQL 11.4 - Host: mysql40-farm15.uni5.net
DATABASE_URL="mysql://centralrnc_add1:gc6j3gtq62@mysql40-farm15.uni5.net:3306/centralrnc"

# JWT Secret (gere um valor seguro e único)
JWT_SECRET=seu-jwt-secret-super-seguro-para-producao-aqui

# Configurações de Email (para envio de códigos 2FA e notificações)
# ⚠️ Configure com suas credenciais reais de SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app-gmail

# Servidor
# ⚠️ IMPORTANTE: Na KingHost, a porta é fornecida automaticamente via process.env.PORT_START (ou PORT_SITE)
# Não é necessário definir PORT no .env - a KingHost fornece automaticamente
# PORT=3006  # Remover ou comentar - a KingHost fornece via process.env.PORT_START
NODE_ENV=production
```

**⚠️ Credenciais MySQL configuradas:**
- **Versão:** MySQL 11.4
- **Host:** mysql40-farm15.uni5.net
- **Porta:** 3306 (padrão)
- **Usuário:** centralrnc_add1
- **Senha:** gc6j3gtq62
- **Banco:** centralrnc

**⚠️ Configurações de Email:**
- **SMTP_HOST:** smtp.gmail.com (padrão Gmail)
- **SMTP_PORT:** 587 (padrão Gmail)
- **SMTP_USER:** Configure com seu email Gmail completo
- **SMTP_PASS:** Configure com a senha de app do Gmail (não a senha normal)
- **Nota:** Para usar Gmail, você precisa criar uma "Senha de App" nas configurações da sua conta Google

**Salvar:** `Ctrl+X`, depois `Y`, depois `Enter`

### 3.3. Configurar Prisma

```bash
# Selecionar Node.js
nvm use 22.1.0
cd ~/apps_nodejs

# Gerar Prisma Client
npx prisma generate
```

**⚠️ IMPORTANTE: Use `db push` em vez de `migrate deploy` para hospedagens compartilhadas!**

```bash
# Usar db push (RECOMENDADO para hospedagens compartilhadas)
# Isso sincroniza o schema diretamente com o banco MySQL
# Não precisa de shadow database nem permissões especiais
npx prisma db push

# Se o banco já tiver tabelas, o Prisma perguntará se deseja resetar
# Responda "y" (yes) se quiser recriar tudo, ou "n" (no) para manter dados existentes
```

**Por que usar `db push` em vez de `migrate deploy`:**
- ✅ Não precisa de shadow database (que requer permissões especiais)
- ✅ Funciona perfeitamente em hospedagens compartilhadas
- ✅ Sincroniza o schema diretamente com o banco
- ✅ Mais simples e direto

**Se der erro sobre banco não vazio:**
```bash
# Se o banco já tiver tabelas e você quiser recriar tudo:
npx prisma db push --accept-data-loss

# OU, se quiser manter os dados existentes:
npx prisma db push --skip-generate
```

**⚠️ Se der erro de autenticação (P1000):**

1. **Verificar credenciais MySQL no painel da KingHost:**
   - Acesse o painel da KingHost
   - Vá em "Banco de Dados MySQL" ou "MySQL"
   - Verifique o usuário, senha e host do banco `centralrnc`
   - **O usuário MySQL pode ser diferente do usuário SSH!**

2. **Testar conexão MySQL manualmente:**
```bash
# Testar conexão com as credenciais corretas
mysql -h mysql40-farm15.uni5.net -u centralrnc_add1 -p centralrnc

# Quando solicitado, digite a senha: gc6j3gtq62
```

3. **Verificar formato do DATABASE_URL no .env:**
```bash
# Verificar conteúdo do .env
cat .env | grep DATABASE_URL

# O formato correto é:
# DATABASE_URL="mysql://usuario:senha@host:porta/banco"
# Exemplo correto:
# DATABASE_URL="mysql://centralrnc_add1:gc6j3gtq62@mysql40-farm15.uni5.net:3306/centralrnc"
```

4. **Credenciais corretas confirmadas:**
   - **Host:** mysql40-farm15.uni5.net
   - **Usuário:** centralrnc_add1
   - **Senha:** gc6j3gtq62
   - **Banco:** centralrnc
   - **Porta:** 3306

**⚠️ Se der erro P3014 (sem permissão para shadow database) ou P3005 (banco não vazio):**

**Solução: Use `db push` (recomendado para hospedagens compartilhadas):**

```bash
# Remover migrações antigas do SQLite (opcional)
rm -rf prisma/migrations

# Usar db push para sincronizar schema com MySQL
# Isso não precisa de shadow database nem permissões especiais
npx prisma db push

# Se perguntar sobre resetar o banco:
# - Digite "y" se quiser recriar todas as tabelas (perde dados existentes)
# - Digite "n" se quiser manter dados existentes
```

**Se o banco já tiver tabelas e você quiser recriar tudo:**
```bash
npx prisma db push --accept-data-loss
```

**Se o banco já tiver tabelas e você quiser manter os dados:**
```bash
# O Prisma tentará sincronizar sem perder dados
npx prisma db push
# Responda "n" quando perguntar sobre resetar
```

---

## 📁 PASSO 4: Criar Diretório de Uploads

```bash
cd ~/apps_nodejs

# Criar diretório para uploads
mkdir -p public/uploads

# Dar permissões corretas
chmod -R 755 public/uploads

# Verificar
ls -la public/uploads
```

---

## ⚙️ PASSO 5: Configurar no Painel da KingHost

**No painel da KingHost, verifique/configure:**

1. **Versão do NodeJS:** `Node.JS 22 (LTS JOD)` ou a versão desejada
2. **Nome da Aplicação:** `site` ✅ (minúsculo - sem confusão)
3. **Caminho da Aplicação:** `/` ⚠️ **CRÍTICO:**
   - ✅ **Configurado como:** `/` (raiz do domínio)
   - ❌ **NÃO use espaços:** `/ ` (errado)
   - O caminho é case-sensitive: `/` ≠ `/Site` ≠ `/site`
   - **Acesso:** `https://central-rnc.com.br/` (raiz do domínio)
4. **Script:** `start.sh` ⚠️ **IMPORTANTE:**
   - O script wrapper `start.sh` deve estar em `~/apps_nodejs/start.sh`
   - O script no painel deve ser: `start.sh`
   - Este script executa `npx tsx api/server.ts` com a versão correta do Node.js
5. **Acesso Web:** `SIM` ⚠️ **OBRIGATÓRIO:**
   - ❌ Se estiver "NÃO", o site não será acessível via web
   - ✅ Deve estar "SIM" para funcionar
6. **Acesso direto à porta:** `SIM` ✅ **CONFIGURADO:**
   - ✅ **Porta configurada:** `21035`
   - **Acesso direto:** `https://central-rnc.com.br:21035`
   - Permite acesso direto pela porta (útil para debug)
7. **Auto Reload:** `SIM` (recomendado)

**⚠️ URLs de acesso configuradas:**
- **Acesso principal (web):** `https://central-rnc.com.br/`
- **Acesso direto (porta):** `https://central-rnc.com.br:21035`

**Salvar as configurações no painel.**

---

## 🚀 PASSO 6: Iniciar Aplicação

**No painel da KingHost:**
- Procure por um botão "Iniciar", "Reiniciar" ou "Deploy"
- Clique para iniciar a aplicação
- A aplicação será gerenciada automaticamente pelo PM2

**OU, via SSH (para verificar):**

```bash
# Selecionar versão do Node.js
nvm use 22.1.0

# Verificar aplicações PM2 rodando
pm2 list

# Ver informações da aplicação (nome: "site" - minúsculo)
pm2 info site

# Ver logs
pm2 logs site
```

---

## 🧪 PASSO 7: Testar Aplicação

**✅ Configuração atual:**
- **Acesso Web:** `https://central-rnc.com.br/` (raiz do domínio)
- **Acesso direto pela porta:** `https://central-rnc.com.br:21035`
- **API:** `https://central-rnc.com.br/api/configurations`
- **Admin:** `https://central-rnc.com.br/admin/login`

**Testar no navegador:**
1. **Site principal:** `https://central-rnc.com.br/`
2. **API Health:** `https://central-rnc.com.br/api/health`
3. **Admin Login:** `https://central-rnc.com.br/admin/login`
4. **Porta direta (debug):** `https://central-rnc.com.br:21035`

**Se der erro 403 Forbidden:**

⚠️ **PROBLEMAS COMUNS:**

1. **Caminho com espaço:** 
   - ❌ `/ site` (com espaço) → Erro 403
   - ✅ `/site` (sem espaço) → Funciona
   - **Solução:** Edite no painel e remova o espaço

2. **Acesso Web desabilitado:**
   - ❌ "Acesso Web: NÃO" → Erro 403
   - ✅ "Acesso Web: SIM" → Funciona
   - **Solução:** Habilite "Acesso Web: SIM" no painel

3. **Caminho case-sensitive:**
   - Configurado como `/` (raiz do domínio)
   - Acesso: `https://central-rnc.com.br/`
   - Porta direta: `https://central-rnc.com.br:21035`

4. **Verificar se a aplicação está rodando:**
   ```bash
   pm2 list
   # Deve mostrar "site" com status "online"
   ```

5. **Verificar logs:**
   ```bash
   pm2 logs site
   ```

6. **Verificar permissões:**
   ```bash
   ls -la ~/apps_nodejs
   chmod -R 755 ~/apps_nodejs
   ```

**Verificar logs:**

**No painel da KingHost:**
- Procure por "Logs" ou "Console" na seção da aplicação

**OU via SSH:**
```bash
# Selecionar versão do Node.js
nvm use 22.1.0

# Verificar processos PM2
pm2 list

# Ver logs do PM2 (nome: "site" - minúsculo)
pm2 logs site

# Ver últimas 100 linhas
pm2 logs site --lines 100

# Monitorar em tempo real
pm2 monit
```

**OU verificar logs diretamente:**
```bash
# Logs ficam em: ~/.pm2/logs/
# Nome do processo: "site" (minúsculo)
tail -f ~/.pm2/logs/site-out.log
tail -f ~/.pm2/logs/site-error.log

# Para ver todos os logs disponíveis:
ls -la ~/.pm2/logs/
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### 🔍 Diagnóstico: Por que o teste.js funciona mas o start.sh não?

**Diferenças principais:**

1. **teste.js (funciona):**
   - ✅ Usa CommonJS (`require`) - mais simples
   - ✅ Porta fixa (21039) - definida manualmente
   - ✅ JavaScript puro - não precisa de TypeScript
   - ✅ Executado diretamente pelo painel

2. **start.sh (nossa aplicação):**
   - ⚠️ Executa TypeScript via `tsx`
   - ⚠️ Precisa carregar NVM corretamente
   - ⚠️ Precisa encontrar `tsx` no PATH
   - ⚠️ Precisa usar porta dinâmica da KingHost

**Solução: Execute o script de diagnóstico primeiro:**

```bash
# No servidor, execute o script de teste
cd ~/apps_nodejs
chmod +x test-start.sh
./test-start.sh
```

Este script verifica:
- ✅ Se o Node.js está disponível
- ✅ Se o NVM está carregado corretamente
- ✅ Se o `tsx` está instalado
- ✅ Se os arquivos necessários existem
- ✅ Quais variáveis de ambiente estão disponíveis

**Depois de executar, corrija os problemas identificados antes de executar `start.sh`.**

### Erro: "Cannot find module 'tsx'"
```bash
cd ~/apps_nodejs
nvm use 22.1.0
npm install tsx --save-dev
```

### Erro: "main.js not found"
- Verifique se o arquivo `main.js` está em `~/apps_nodejs/`
- Verifique o caminho do "Script" no painel da KingHost

### Erro: "require is not defined in ES module scope"
- O projeto usa ES modules (`"type": "module"` no package.json)
- O `main.js` precisa usar `import` em vez de `require`
- Faça upload do arquivo `main.js` corrigido para o servidor

### Erro: "Package subpath './esm/api/register.js' is not defined"
- O tsx não pode ser importado como módulo ES dessa forma
- **Solução 1 (Recomendada):** Configure o painel para usar `tsx api/server.ts` diretamente como script (em vez de `main.js`)
- **Solução 2:** Compile o TypeScript para JavaScript primeiro:
```bash
# No servidor, compile o TypeScript
cd ~/apps_nodejs
npx tsc api/server.ts --outDir api/dist --module esnext --target es2020 --moduleResolution node

# Depois altere o main.js para importar o JS compilado:
# await import('./api/dist/server.js');
```
- **Solução 3:** Use o tsx como interpreter no PM2 (se possível)

### Erro: "site doesn't exist" no PM2
- O PM2 é case-sensitive (diferencia maiúsculas de minúsculas)
- Verifique o nome exato do processo com `pm2 list`
- Nome da aplicação: "site" (minúsculo)
- Use sempre: `pm2 info site` e `pm2 logs site` (minúsculo)

### Erro: "Cannot connect to database"
- Verifique se o arquivo `.env` está configurado corretamente
- Verifique se as credenciais MySQL estão corretas:
  - Host: mysql.central-rnc.com.br
  - Usuário: central-rnc
  - Senha: gc6j3gtq62
  - Banco: centralrnc
- Teste a conexão: `mysql -h mysql40-farm15.uni5.net -u centralrnc_add1 -p centralrnc`

### Erro: "Port already in use"
- A KingHost geralmente define a porta automaticamente
- Verifique no painel qual porta está sendo usada
- Use `process.env.PORT` no código (já está configurado)

### Aplicação não inicia
- Verifique os logs no painel ou via `pm2 logs site` (nome: "site" - minúsculo)
- Verifique se todas as dependências foram instaladas
- Verifique se o arquivo `.env` está configurado
- Verifique se o `main.js` está correto ou se está usando `tsx api/server.ts` diretamente

### Erro 403 Forbidden ao acessar o site

**Diagnóstico passo a passo:**

1. **Verificar se a aplicação está rodando:**
```bash
pm2 list
# Deve mostrar "site" com status "online"
```

2. **Verificar logs para erros:**
```bash
pm2 logs site --lines 50
# Procure por erros de importação, conexão, etc.
```

3. **Testar se a API está respondendo:**
```bash
# No servidor, teste localmente:
curl http://localhost:3006/api/health
# OU
curl http://localhost:PORTA/api/health
# (substitua PORTA pela porta configurada no painel)
```

4. **Verificar se o dist/ existe e tem arquivos:**
```bash
ls -la ~/apps_nodejs/dist/
# Deve mostrar index.html e pasta assets/
```

5. **Verificar permissões:**
```bash
chmod -R 755 ~/apps_nodejs
chmod -R 755 ~/apps_nodejs/dist
```

6. **Verificar se o Nginx está fazendo proxy:**
- O erro 403 pode ser do Nginx, não da aplicação Node.js
- A KingHost pode precisar configurar o proxy reverso no painel
- Verifique no painel se há opções de "Proxy" ou "Reverse Proxy"

7. **Tentar acessar a porta direta:**
- No painel, verifique se há uma "porta de acesso direto"
- Tente: `https://central-rnc.com.br:PORTA` (substitua PORTA)

8. **Verificar configuração do painel:**
- "Acesso Web" deve estar como "SIM"
- "Acesso direto à porta" deve estar como "SIM"
- Verifique qual porta está sendo usada

---

## 📝 CHECKLIST FINAL

- [ ] Todos os arquivos enviados via FTP para `~/apps_nodejs/` (raiz)
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `prisma/schema.prisma` alterado para MySQL
- [ ] Arquivo `.env` criado com `DATABASE_URL` do MySQL
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Migrações executadas (`npx prisma migrate deploy`)
- [ ] Diretório `public/uploads` criado com permissões corretas
- [ ] Configurações no painel da KingHost verificadas (Script: `main.js`)
- [ ] Aplicação iniciada no painel
- [ ] Site acessível via navegador
- [ ] API respondendo corretamente
- [ ] Logs sem erros críticos

---

## 🎉 PRONTO!

Sua aplicação deve estar rodando usando o gerenciamento automático da KingHost!

**Vantagens:**
- ✅ Node.js 22 configurado automaticamente
- ✅ Gerenciamento automático do processo (PM2)
- ✅ Auto-reload quando arquivos são alterados
- ✅ Logs centralizados
- ✅ Reinicialização automática em caso de falha

---

## 📞 INFORMAÇÕES ÚTEIS

**Diretórios importantes:**
- Aplicação: `~/apps_nodejs/` (raiz)
- Logs PM2: `~/.pm2/logs/`
- Diretório web público: `~/public_html/`

**Comandos úteis:**
```bash
# Selecionar Node.js
nvm use 22

# Ver aplicações PM2
pm2 list

# Ver logs
pm2 logs site

# Reiniciar aplicação
pm2 restart site
```
