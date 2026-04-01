# 🚀 Guia de Deploy para Produção - KingHost via SSH

Este guia fornece instruções passo a passo para fazer o deploy do projeto na KingHost usando SSH.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Acesso SSH ao servidor KingHost
- ✅ Credenciais de acesso (usuário e senha ou chave SSH)
- ✅ Node.js instalado no servidor (versão 18 ou superior)
- ✅ npm ou yarn instalado
- ✅ PM2 instalado globalmente (para manter o processo rodando)
- ✅ Acesso ao painel da KingHost para configurar domínio/porta

---

## 🔧 Passo 1: Preparação Local (Build do Projeto)

### 1.1. Verificar e atualizar variáveis de ambiente

Crie um arquivo `.env.production` na raiz do projeto com as variáveis de produção:

```env
# JWT Secret (OBRIGATÓRIO - use um valor seguro e único)
JWT_SECRET=seu-jwt-secret-super-seguro-para-producao-aqui

# Configurações de Email (OBRIGATÓRIO para funcionalidades de email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# Porta do servidor (ajuste conforme necessário)
PORT=3006

# Ambiente
NODE_ENV=production

# URL da API em produção (ajuste com o domínio do seu servidor)
VITE_API_URL=https://seudominio.com.br/api
```

**⚠️ IMPORTANTE:** 
- Gere um `JWT_SECRET` único e seguro para produção
- Não use o mesmo `JWT_SECRET` do ambiente de desenvolvimento
- Mantenha este arquivo seguro e não o commite no Git

### 1.2. Build do Frontend

Execute o build do frontend:

```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos estáticos compilados.

### 1.3. Verificar estrutura de pastas

Certifique-se de que as seguintes pastas existem e contêm os arquivos necessários:

```
projeto/
├── dist/                    # Build do frontend (gerado pelo npm run build)
├── api/                     # Código do backend
├── prisma/                  # Schema e migrações do banco
├── public/                  # Arquivos estáticos (uploads, etc.)
└── package.json
```

---

## 📤 Passo 2: Preparar Arquivos para Upload

### 2.1. Criar arquivo .gitignore para produção (opcional)

Se necessário, crie um `.gitignore.production` para excluir arquivos desnecessários:

```
node_modules/
.env
.env.local
dist/
*.log
.DS_Store
```

### 2.2. Compactar o projeto (opcional)

Você pode compactar o projeto para facilitar o upload:

```bash
# No Windows (PowerShell)
Compress-Archive -Path . -DestinationPath projeto-producao.zip -Force

# No Linux/Mac
tar -czf projeto-producao.tar.gz .
```

**⚠️ IMPORTANTE:** Não inclua:
- `node_modules/` (será instalado no servidor)
- `.env` ou `.env.local` (será criado no servidor)
- `prisma/dev.db` (banco de desenvolvimento)

---

## 🔐 Passo 3: Conectar ao Servidor via SSH

### 3.1. Conectar via SSH

```bash
ssh usuario@ip-do-servidor-kinghost
# ou
ssh usuario@seudominio.com.br
```

Substitua:
- `usuario`: seu usuário SSH na KingHost
- `ip-do-servidor-kinghost`: IP do servidor ou domínio

### 3.2. Navegar para o diretório do projeto

Após conectar, navegue para o diretório onde o projeto será hospedado:

```bash
cd ~/public_html
# ou
cd /var/www/html
# ou o diretório específico fornecido pela KingHost
```

**💡 Dica:** Verifique com o suporte da KingHost qual é o diretório correto para hospedar aplicações Node.js.

---

## 📁 Passo 4: Upload dos Arquivos

### 4.1. Opção A: Upload via SCP (recomendado)

Do seu computador local, execute:

```bash
# Upload de todos os arquivos (exceto node_modules e .env)
scp -r ./api usuario@ip-do-servidor:/caminho/do/projeto/
scp -r ./prisma usuario@ip-do-servidor:/caminho/do/projeto/
scp -r ./public usuario@ip-do-servidor:/caminho/do/projeto/
scp -r ./dist usuario@ip-do-servidor:/caminho/do/projeto/
scp ./package.json usuario@ip-do-servidor:/caminho/do/projeto/
scp ./package-lock.json usuario@ip-do-servidor:/caminho/do/projeto/
scp ./tsconfig.json usuario@ip-do-servidor:/caminho/do/projeto/
scp ./vite.config.ts usuario@ip-do-servidor:/caminho/do/projeto/
scp ./tailwind.config.js usuario@ip-do-servidor:/caminho/do/projeto/
scp ./postcss.config.js usuario@ip-do-servidor:/caminho/do/projeto/
scp ./index.html usuario@ip-do-servidor:/caminho/do/projeto/
```

### 4.2. Opção B: Upload via Git (recomendado se já está no GitHub)

No servidor, clone o repositório:

```bash
cd /caminho/do/projeto
git clone https://github.com/SeuUsuario/seu-repositorio.git .
```

### 4.3. Opção C: Upload via FTP/SFTP

Use um cliente FTP como FileZilla, WinSCP ou Cyberduck para fazer upload dos arquivos.

---

## ⚙️ Passo 5: Configuração no Servidor

### 5.1. Instalar dependências

No servidor, navegue até o diretório do projeto e instale as dependências:

```bash
cd /caminho/do/projeto
npm install --production
```

### 5.2. Criar arquivo .env no servidor

Crie o arquivo `.env` no servidor com as variáveis de produção:

```bash
nano .env
```

Cole o conteúdo do seu `.env.production` (criado no Passo 1.1) e ajuste conforme necessário:

```env
JWT_SECRET=seu-jwt-secret-super-seguro-para-producao-aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
PORT=3006
NODE_ENV=production
```

Salve e saia (Ctrl+X, depois Y, depois Enter no nano).

### 5.3. Gerar Prisma Client

```bash
npx prisma generate
```

### 5.4. Configurar banco de dados

#### Opção A: SQLite (mesmo banco de desenvolvimento)

```bash
# Criar diretório para o banco (se não existir)
mkdir -p prisma

# Executar migrações
npx prisma migrate deploy

# OU, se for a primeira vez, criar o banco:
npx prisma db push
```

#### Opção B: Migrar para MySQL/PostgreSQL (recomendado para produção)

Se a KingHost oferecer MySQL ou PostgreSQL, atualize o `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"  // ou "postgresql"
  url      = env("DATABASE_URL")
}
```

E no `.env`:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"
```

Depois execute:

```bash
npx prisma migrate deploy
```

### 5.5. Popular banco de dados (seed) - OPCIONAL

Se necessário, execute o seed para criar dados iniciais:

```bash
npm run seed
```

**⚠️ ATENÇÃO:** Isso criará administradores padrão. Certifique-se de alterar as senhas após o primeiro login.

### 5.6. Criar diretório de uploads

```bash
mkdir -p public/uploads
chmod -R 755 public/uploads
```

---

## 🚀 Passo 6: Configurar PM2 (Process Manager)

### 6.1. Instalar PM2 globalmente

```bash
npm install -g pm2
```

### 6.2. Criar arquivo de configuração do PM2

Crie um arquivo `ecosystem.config.js` na raiz do projeto:

```javascript
module.exports = {
  apps: [{
    name: 'site-contabil-api',
    script: './api/server.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx/esm',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3006
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

**⚠️ NOTA:** Se o servidor não suportar TypeScript diretamente, você precisará compilar o TypeScript primeiro ou usar `tsx`:

```bash
npm install -g tsx
```

E ajustar o `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'site-contabil-api',
    script: './api/server.ts',
    interpreter: 'tsx',
    // ... resto da configuração
  }]
};
```

### 6.3. Iniciar aplicação com PM2

```bash
pm2 start ecosystem.config.js
```

### 6.4. Configurar PM2 para iniciar automaticamente

```bash
pm2 startup
pm2 save
```

Isso garantirá que a aplicação reinicie automaticamente após reinicializações do servidor.

### 6.5. Comandos úteis do PM2

```bash
pm2 list              # Listar processos
pm2 logs               # Ver logs
pm2 restart site-contabil-api  # Reiniciar aplicação
pm2 stop site-contabil-api     # Parar aplicação
pm2 delete site-contabil-api   # Remover aplicação
```

---

## 🌐 Passo 7: Configurar Servidor Web (Nginx/Apache)

### 7.1. Configuração Nginx (se disponível)

Crie ou edite o arquivo de configuração do Nginx:

```bash
sudo nano /etc/nginx/sites-available/seudominio.com.br
```

Adicione a configuração:

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    # Redirecionar para HTTPS (se tiver SSL)
    # return 301 https://$server_name$request_uri;

    # Servir arquivos estáticos do frontend
    root /caminho/do/projeto/dist;
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
        alias /caminho/do/projeto/public/uploads;
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

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/seudominio.com.br /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx  # Recarregar Nginx
```

### 7.2. Configuração Apache (se disponível)

Crie ou edite o arquivo `.htaccess` no diretório do projeto:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Proxy para API
    RewriteCond %{REQUEST_URI} ^/api
    RewriteRule ^api/(.*)$ http://localhost:3006/api/$1 [P,L]
    
    # Servir uploads
    RewriteCond %{REQUEST_URI} ^/uploads
    RewriteRule ^uploads/(.*)$ /public/uploads/$1 [L]
    
    # Frontend (SPA)
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

---

## 🔒 Passo 8: Configurar SSL/HTTPS (Recomendado)

### 8.1. Usando Let's Encrypt (Certbot)

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

Siga as instruções para configurar o certificado SSL.

---

## ✅ Passo 9: Verificação e Testes

### 9.1. Verificar se a API está rodando

```bash
curl http://localhost:3006/api/configurations
```

### 9.2. Verificar logs

```bash
pm2 logs site-contabil-api
```

### 9.3. Testar acesso ao site

Acesse no navegador:
- Frontend: `https://seudominio.com.br`
- API: `https://seudominio.com.br/api/configurations`
- Admin: `https://seudominio.com.br/admin/login`

### 9.4. Verificar permissões de arquivos

```bash
# Verificar permissões do diretório de uploads
ls -la public/uploads

# Ajustar permissões se necessário
chmod -R 755 public/uploads
chown -R usuario:usuario public/uploads
```

---

## 🔄 Passo 10: Atualizações Futuras

Para atualizar o projeto no futuro:

### 10.1. Via Git (recomendado)

```bash
cd /caminho/do/projeto
git pull origin master
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart site-contabil-api
```

### 10.2. Via Upload Manual

1. Faça o build localmente: `npm run build`
2. Faça upload dos arquivos atualizados via SCP/FTP
3. No servidor:
   ```bash
   npm install --production
   npx prisma generate
   npx prisma migrate deploy
   pm2 restart site-contabil-api
   ```

---

## 🐛 Solução de Problemas

### Erro: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Erro: "Port already in use"

Verifique qual processo está usando a porta:

```bash
lsof -i :3006
# ou
netstat -tulpn | grep 3006
```

Pare o processo ou altere a porta no `.env`.

### Erro: "Permission denied" ao criar arquivos

Ajuste as permissões:

```bash
chmod -R 755 public/uploads
chown -R usuario:usuario public/uploads
```

### Erro: "Database locked" (SQLite)

Isso pode acontecer se múltiplas instâncias tentarem acessar o banco. Considere migrar para MySQL/PostgreSQL em produção.

### Aplicação não inicia com PM2

Verifique os logs:

```bash
pm2 logs site-contabil-api --lines 50
```

Verifique se todas as variáveis de ambiente estão configuradas corretamente.

### Frontend não carrega

Verifique:
1. Se o build foi feito corretamente (`dist/` existe)
2. Se o Nginx/Apache está servindo os arquivos corretamente
3. Se a variável `VITE_API_URL` está configurada no build

**💡 Dica:** Refaça o build com a URL correta:

```bash
VITE_API_URL=https://seudominio.com.br/api npm run build
```

---

## 📞 Suporte KingHost

Se encontrar problemas específicos da KingHost:

1. Verifique a documentação da KingHost sobre Node.js
2. Entre em contato com o suporte técnico
3. Verifique se o plano de hospedagem suporta Node.js e PM2

---

## 📝 Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Build do frontend executado com sucesso
- [ ] Arquivos enviados para o servidor
- [ ] Dependências instaladas (`npm install --production`)
- [ ] Arquivo `.env` criado no servidor com todas as variáveis
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Banco de dados configurado e migrações executadas
- [ ] Diretório `public/uploads` criado com permissões corretas
- [ ] PM2 configurado e aplicação rodando
- [ ] PM2 configurado para iniciar automaticamente
- [ ] Nginx/Apache configurado corretamente
- [ ] SSL/HTTPS configurado (recomendado)
- [ ] Site acessível via navegador
- [ ] API respondendo corretamente
- [ ] Área administrativa acessível
- [ ] Upload de arquivos funcionando
- [ ] Envio de emails funcionando (se aplicável)

---

## 🎉 Conclusão

Após seguir todos os passos, seu projeto estará em produção na KingHost!

**Lembre-se de:**
- Fazer backups regulares do banco de dados
- Monitorar os logs regularmente
- Manter as dependências atualizadas
- Testar atualizações em ambiente de desenvolvimento antes de aplicar em produção

Boa sorte com o deploy! 🚀



