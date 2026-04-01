# 🚀 Deploy Manual - Passo a Passo via SSH

Você está conectado ao servidor via SSH. Siga estes passos na ordem.

---

## 📍 PASSO 1: Verificar e Criar Estrutura de Diretórios no Servidor

**⚠️ IMPORTANTE: Execute este passo PRIMEIRO no servidor via SSH antes de fazer upload!**

**No servidor (via SSH), execute:**

```bash
# Verificar onde você está
pwd

# Verificar estrutura do diretório home
ls -la ~/

# Criar diretório do projeto no home (onde você tem permissão)
mkdir -p ~/public_html/site

# Verificar se foi criado
ls -la ~/public_html/

# Navegar para o diretório
cd ~/public_html/site
pwd

# Verificar permissões
ls -la
```

**Caminho correto:** `~/public_html/site` (ou `/home/central-rnc/public_html/site`)

---

## 📤 PASSO 2: Fazer Upload dos Arquivos

**⚠️ Só execute este passo DEPOIS de criar o diretório no servidor (Passo 1)!**

**Do seu computador local (PowerShell), execute:**

```powershell
# Navegar para o diretório do projeto
cd C:\Users\wagner\Desktop\PROJETOS\SITE

# ⚠️ IMPORTANTE: Use o caminho correto baseado no que você verificou no Passo 1
# Se criou em /www/site, use: /www/site
# Se criou em ~/www/site, use: ~/www/site

# Upload das pastas principais (caminho correto: ~/public_html/site)
scp -r ./api central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp -r ./prisma central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp -r ./public central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp -r ./dist central-rnc@ftp.central-rnc.com.br:~/public_html/site/

# Upload dos arquivos de configuração
scp ./package.json central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp ./package-lock.json central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp ./ecosystem.config.js central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp ./tsconfig.json central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp ./vite.config.ts central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp ./tailwind.config.js central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp ./postcss.config.js central-rnc@ftp.central-rnc.com.br:~/public_html/site/
scp ./index.html central-rnc@ftp.central-rnc.com.br:~/public_html/site/
```

**Senha quando solicitado:** `gc6j3gtq62`

**Caminho correto:** `~/public_html/site` (ou `/home/central-rnc/public_html/site`)

**Alternativa - Usar FileZilla/WinSCP:**
Se o SCP continuar dando erro, use o FileZilla:
1. No FileZilla, navegue até `/home/central-rnc/public_html/site` no servidor remoto
2. Arraste as pastas `api`, `prisma`, `public`, `dist` da esquerda para a direita
3. Arraste os arquivos `package.json`, `ecosystem.config.js`, etc.

---

## ✅ PASSO 3: Verificar Arquivos no Servidor

**No servidor (via SSH), execute:**

```bash
cd ~/public_html/site
ls -la

# Você deve ver:
# - api/
# - prisma/
# - public/
# - dist/
# - package.json
# - ecosystem.config.js
# - etc.
```

---

## 📦 PASSO 4: Verificar e Atualizar Node.js (IMPORTANTE!)

**⚠️ O projeto requer Node.js 18 ou superior. Verifique primeiro:**

```bash
# Verificar versão atual do Node.js
node --version

# Verificar onde está o Node.js atual
which node

# Verificar se há múltiplas versões instaladas
whereis node

# Verificar versões disponíveis no sistema
ls -la /usr/bin/node* 2>/dev/null
ls -la /usr/local/bin/node* 2>/dev/null
ls -la ~/.nvm/versions/node/ 2>/dev/null
```

### Opção A: Se o servidor já tem Node.js 22 instalado (mais comum)

```bash
# Verificar se Node.js 22 está em algum lugar do sistema
find /usr -name "node" -type f 2>/dev/null | grep -E "node|nodejs"
find /opt -name "node" -type f 2>/dev/null
find /home -name "node" -type f 2>/dev/null | head -5

# Verificar se há módulos do Node.js 22
ls -la /usr/lib/node_modules 2>/dev/null
ls -la /opt/nodejs* 2>/dev/null

# Verificar variáveis de ambiente
echo $PATH
env | grep -i node

# Atualizar PATH para usar Node.js 22 (ajuste o caminho conforme encontrado)
# Exemplo comum:
export PATH="/usr/bin:$PATH"
# OU
export PATH="/opt/nodejs/bin:$PATH"
# OU (se estiver em um diretório específico)
export PATH="/usr/local/nodejs/bin:$PATH"

# Verificar novamente
node --version
which node
```

### Opção B: Usar NVM (Node Version Manager) - RECOMENDADO

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar o shell
source ~/.bashrc

# OU, se não funcionar:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js 22 (ou 18 LTS)
nvm install 22
# OU
nvm install 18

# Usar Node.js 22
nvm use 22

# Verificar versão
node --version  # Deve mostrar v22.x.x ou superior

# Tornar esta versão padrão
nvm alias default 22

# Adicionar ao .bashrc para persistir
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
```

### Opção C: Verificar painel da KingHost

Algumas hospedagens têm um painel onde você pode selecionar a versão do Node.js:
1. Acesse o painel de controle da KingHost
2. Procure por "Node.js" ou "Versões do Node"
3. Selecione Node.js 22
4. Reinicie a sessão SSH

**Após atualizar o Node.js, continue com a instalação das dependências.**

---

## 📦 PASSO 5: Instalar Dependências

```bash
# Certificar que está no diretório correto
cd ~/public_html/site

# Verificar novamente a versão do Node.js (deve ser 18+)
node --version

# Instalar dependências de produção
npm install --production

# Aguardar conclusão (pode demorar alguns minutos)
```

**Se ainda der erro com Prisma:**
```bash
# Tentar instalar sem o flag --production (instala devDependencies também)
npm install

# OU, se o problema persistir, pode ser necessário usar uma versão mais antiga do Prisma
# (mas isso não é recomendado - melhor atualizar o Node.js)
```

---

## 🔧 PASSO 6: Configurar Prisma

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrações do banco de dados
npx prisma migrate deploy

# OU, se for a primeira vez e não houver migrações:
npx prisma db push
```

---

## 📁 PASSO 7: Criar Diretório de Uploads

```bash
# Criar diretório para uploads de imagens/arquivos
mkdir -p public/uploads

# Dar permissões corretas
chmod -R 755 public/uploads

# Verificar
ls -la public/uploads
```

---

## 🔐 PASSO 8: Criar Arquivo .env

```bash
# Criar arquivo .env
nano .env
```

**Cole o seguinte conteúdo no arquivo (ajuste conforme necessário):**

```env
JWT_SECRET=seu-jwt-secret-super-seguro-para-producao-aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
PORT=3006
NODE_ENV=production
```

**Para salvar no nano:**
1. Pressione `Ctrl + X`
2. Pressione `Y` para confirmar
3. Pressione `Enter` para salvar

**⚠️ IMPORTANTE:**
- Gere um `JWT_SECRET` único e seguro (pode usar: `openssl rand -base64 32`)
- Configure as credenciais de email corretas
- Não compartilhe este arquivo

---

## 🚀 PASSO 9: Instalar PM2 e TSX

```bash
# Instalar PM2 globalmente (gerenciador de processos)
npm install -g pm2

# Instalar TSX globalmente (para executar TypeScript)
npm install -g tsx

# Verificar instalação
pm2 --version
tsx --version
```

---

## ▶️ PASSO 10: Iniciar Aplicação com PM2

```bash
# Certificar que está no diretório do projeto
cd ~/public_html/site

# Iniciar aplicação
pm2 start ecosystem.config.js

# Ver status
pm2 list

# Ver logs em tempo real
pm2 logs site-contabil-api

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar automaticamente após reinicialização
pm2 startup

# Siga as instruções que aparecerem (pode pedir para executar um comando como sudo)
```

---

## 🧪 PASSO 11: Testar Aplicação

```bash
# Testar se a API está respondendo
curl http://localhost:3006/api/configurations

# OU testar com o IP do servidor (se souber)
curl http://SEU_IP:3006/api/configurations

# Ver logs para verificar erros
pm2 logs site-contabil-api --lines 50
```

---

## 🌐 PASSO 12: Configurar Proxy Reverso (Nginx/Apache)

**Se você tiver acesso ao Nginx:**

```bash
# Criar/editar configuração do Nginx
sudo nano /etc/nginx/sites-available/central-rnc.com.br
```

**Cole a configuração:**

```nginx
server {
    listen 80;
    server_name central-rnc.com.br www.central-rnc.com.br;

    # Servir arquivos estáticos do frontend
    root /home/central-rnc/public_html/site/dist;
    index index.html;

    # Proxy para API
    location /api {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir uploads
    location /uploads {
        alias /home/central-rnc/public_html/site/public/uploads;
    }

    # Frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Ativar site:**

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/central-rnc.com.br /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

**Se usar Apache, consulte o arquivo `GUIA_DEPLOY_PRODUCAO.md`.**

---

## ✅ PASSO 13: Verificar se Está Funcionando

**Acesse no navegador:**
- Site: `http://central-rnc.com.br` ou `https://central-rnc.com.br`
- Admin: `http://central-rnc.com.br/admin/login`
- API: `http://central-rnc.com.br/api/configurations`

**No servidor, verifique logs:**

```bash
# Ver logs do PM2
pm2 logs site-contabil-api

# Ver status
pm2 status

# Ver informações detalhadas
pm2 info site-contabil-api
```

---

## 🔄 COMANDOS ÚTEIS DO PM2

```bash
# Listar processos
pm2 list

# Parar aplicação
pm2 stop site-contabil-api

# Reiniciar aplicação
pm2 restart site-contabil-api

# Ver logs
pm2 logs site-contabil-api

# Ver logs das últimas 100 linhas
pm2 logs site-contabil-api --lines 100

# Monitorar em tempo real
pm2 monit

# Deletar aplicação do PM2
pm2 delete site-contabil-api
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Erro: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Erro: "Port 3006 already in use"
```bash
# Ver qual processo está usando a porta
lsof -i :3006
# ou
netstat -tulpn | grep 3006

# Parar o processo ou alterar a porta no .env
```

### Erro: "Permission denied" ao criar arquivos
```bash
# Ajustar permissões
chmod -R 755 public/uploads
chown -R central-rnc:central-rnc public/uploads
```

### Aplicação não inicia
```bash
# Ver logs detalhados
pm2 logs site-contabil-api --lines 50

# Verificar se o .env está correto
cat .env

# Verificar se todas as dependências estão instaladas
npm list --depth=0
```

### Frontend não carrega
```bash
# Verificar se a pasta dist existe
ls -la dist/

# Verificar permissões
chmod -R 755 dist/
```

---

## 📝 CHECKLIST FINAL

Antes de considerar o deploy completo, verifique:

- [ ] Todos os arquivos foram enviados para o servidor
- [ ] Dependências instaladas (`npm install --production`)
- [ ] Arquivo `.env` criado com todas as variáveis
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Migrações executadas (`npx prisma migrate deploy`)
- [ ] Diretório `public/uploads` criado com permissões corretas
- [ ] PM2 instalado e aplicação rodando (`pm2 list`)
- [ ] PM2 configurado para iniciar automaticamente (`pm2 startup`)
- [ ] Nginx/Apache configurado (se aplicável)
- [ ] Site acessível via navegador
- [ ] API respondendo corretamente
- [ ] Área administrativa acessível
- [ ] Logs sem erros críticos

---

## 🎉 PRONTO!

Se todos os passos foram concluídos com sucesso, seu site está em produção!

**Para atualizações futuras, consulte a seção "Atualizações Futuras" no arquivo `GUIA_DEPLOY_PRODUCAO.md`.**

