# 🚀 Guia Completo de Deploy - VPS Hostinger

Este guia detalha como fazer o deploy completo da aplicação em uma VPS da Hostinger, instalando todos os componentes necessários.

## 📋 Pré-requisitos

- ✅ Acesso SSH à VPS Hostinger
- ✅ Usuário com permissões sudo
- ✅ Domínio apontado para o IP da VPS (opcional, mas recomendado)

## 🔑 Credenciais da VPS

- **IP:** `72.60.155.69`
- **Usuário:** `root`
- **Senha:** `SUA_SENHA_VPS_AQUI`
- **Domínio:** `central-rnc.com.br`

**Comando SSH:**
```bash
ssh root@72.60.155.69
# Senha: SUA_SENHA_VPS_AQUI
```

## 🎯 Estrutura do Deploy

```
/root/
├── app/                    # Aplicação Node.js
│   ├── api/               # Backend
│   ├── dist/              # Frontend build
│   ├── prisma/            # Schema e migrations
│   ├── public/            # Arquivos estáticos
│   ├── .env               # Variáveis de ambiente
│   └── package.json
├── logs/                   # Logs da aplicação
└── backups/               # Backups do banco de dados
```

## 📦 Passo 1: Instalação Inicial do Sistema

### 1.1 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar dependências básicas

```bash
sudo apt install -y curl wget git build-essential software-properties-common
```

## 🔧 Passo 2: Instalação do Node.js (via NVM)

### 2.1 Instalar NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### 2.2 Carregar NVM no shell atual

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### 2.3 Instalar Node.js 22 (LTS)

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

### 2.4 Verificar instalação

```bash
node --version  # Deve mostrar v22.x.x
npm --version
```

### 2.5 Adicionar NVM ao .bashrc (para carregar automaticamente)

```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
```

## 🗄️ Passo 3: Instalação do PostgreSQL

### 3.1 Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

### 3.2 Iniciar e habilitar PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.3 Criar banco de dados e usuário

```bash
# Entrar como usuário postgres
sudo -u postgres psql

# No prompt do PostgreSQL, execute:
CREATE DATABASE central_rnc;
CREATE USER central_rnc_user WITH ENCRYPTED PASSWORD 'SUA_SENHA_VPS_AQUI';
GRANT ALL PRIVILEGES ON DATABASE central_rnc TO central_rnc_user;
ALTER USER central_rnc_user CREATEDB;

-- Conceder permissões no schema public
GRANT ALL ON SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO central_rnc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO central_rnc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO central_rnc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO central_rnc_user;

\q
```

**⚠️ IMPORTANTE:** 
- Senha configurada: `SUA_SENHA_VPS_AQUI`
- Na `DATABASE_URL` do `.env`, os caracteres `@` devem ser codificados como `%40`
- Senha na URL: `Pkg%40%40gUI4557` (dois `@` = dois `%40`)

### 3.4 Testar conexão

```bash
psql -U central_rnc_user -d central_rnc -h localhost
# Digite a senha quando solicitado
# Digite \q para sair
```

## 📦 Passo 4: Instalação do PM2

### 4.1 Instalar PM2 globalmente

```bash
npm install -g pm2
```

### 4.2 Configurar PM2 para iniciar no boot

```bash
pm2 startup
# Execute o comando que aparecer (algo como: sudo env PATH=...)
```

### 4.3 Salvar configuração atual do PM2

```bash
pm2 save
```

## 🌐 Passo 5: Instalação e Configuração do Nginx

### 5.1 Instalar Nginx

```bash
sudo apt install -y nginx
```

### 5.2 Iniciar e habilitar Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.3 Configurar Nginx como reverse proxy

Crie o arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/central-rnc
```

Cole o seguinte conteúdo (ajuste o domínio):

```nginx
server {
    listen 80;
    server_name central-rnc.com.br www.central-rnc.com.br;

    # Logs
    access_log /var/log/nginx/central-rnc-access.log;
    error_log /var/log/nginx/central-rnc-error.log;

    # Tamanho máximo de upload (ajuste conforme necessário)
    client_max_body_size 50M;

    # Frontend (arquivos estáticos)
    location / {
        root /root/app/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Backend
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploads (arquivos enviados)
    location /uploads {
        alias /root/app/public/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

### 5.4 Ativar configuração

```bash
sudo ln -s /etc/nginx/sites-available/central-rnc /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

## 📁 Passo 6: Preparar Estrutura de Diretórios

### 6.1 Criar diretórios

```bash
mkdir -p ~/app
mkdir -p ~/logs
mkdir -p ~/backups
```

### 6.2 Definir permissões

```bash
chmod 755 ~/app
chmod 755 ~/logs
chmod 755 ~/backups
```

## 📤 Passo 7: Upload dos Arquivos

### 7.1 Via SCP (do seu computador local)

```bash
# No seu computador local (Windows PowerShell ou Linux/Mac)
# IP da VPS: 72.60.155.69
# Senha: SUA_SENHA_VPS_AQUI

# Opção 1: SCP (será solicitada a senha)
scp -r ./api ./prisma ./public ./package.json ./package-lock.json ./tsconfig.json ./vite.config.ts ./tailwind.config.js ./postcss.config.js ./index.html root@72.60.155.69:/root/app/

# Opção 2: SCP com sshpass (Linux/Mac - instale: sudo apt install sshpass)
sshpass -p 'SUA_SENHA_VPS_AQUI' scp -r ./api ./prisma ./public ./package.json ./package-lock.json ./tsconfig.json ./vite.config.ts ./tailwind.config.js ./postcss.config.js ./index.html root@72.60.155.69:/root/app/

# Opção 3: Enviar também o diretório src/
scp -r ./src root@72.60.155.69:/root/app/
```

### 7.2 Via Git (recomendado)

```bash
# Na VPS
cd ~/app
git clone https://github.com/seu-usuario/seu-repositorio.git .
# OU se já tiver o repositório configurado
git pull origin main
```

### 7.3 Via FTP/SFTP

Use um cliente FTP como FileZilla ou WinSCP para fazer upload dos arquivos.

## 🔐 Passo 8: Configurar Variáveis de Ambiente

### 8.1 Criar arquivo .env

```bash
cd ~/app
nano .env
```

### 8.2 Conteúdo do .env

```env
# Ambiente
NODE_ENV=production

# Porta do servidor
PORT=3006

# JWT Secret (gere um valor aleatório seguro)
JWT_SECRET=GERE_UM_JWT_SECRET_SUPER_SEGURO_AQUI_USE_OPENSSL_RAND_BASE64_32

# Banco de Dados PostgreSQL
# Senha: SUA_SENHA_VPS_AQUI
# ⚠️ IMPORTANTE: Caracteres @ devem ser codificados como %40 na URL
# Senha original: SUA_SENHA_VPS_AQUI
# Senha codificada: Pkg%40%40gUI4557
DATABASE_URL="postgresql://central_rnc_user:Pkg%40%40gUI4557@localhost:5432/central_rnc?schema=public"

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# URL da aplicação
APP_URL=https://central-rnc.com.br
```

**⚠️ IMPORTANTE:** 
- Gere um JWT_SECRET seguro: `openssl rand -base64 32`
- Senha do PostgreSQL: `SUA_SENHA_VPS_AQUI`
- **Na DATABASE_URL, codifique os caracteres `@` como `%40`**: `Pkg%40%40gUI4557`
- Se precisar alterar a senha, veja: `REDEFINIR_SENHA_POSTGRESQL.md`
- Configure as credenciais de email SMTP

## 🗄️ Passo 9: Configurar Banco de Dados

### 9.1 Atualizar schema Prisma para PostgreSQL

O arquivo `prisma/schema.prisma` deve ter:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 9.2 Instalar dependências

```bash
cd ~/app
npm install --production
```

### 9.3 Gerar Prisma Client

```bash
npx prisma generate
```

### 9.4 Sincronizar schema com banco (db push)

**⚠️ IMPORTANTE:** Se você migrou de SQLite para PostgreSQL, as migrações antigas não funcionarão.

**Opção A: Usar `db push` (Recomendado - mais simples)**
```bash
# Remover migrações antigas (se existirem)
rm -rf prisma/migrations

# Sincronizar schema diretamente com o banco
npx prisma db push
# Digite 'y' quando perguntado
```

**Opção B: Criar novas migrações para PostgreSQL**
```bash
# Remover migrações antigas
rm -rf prisma/migrations

# Criar nova migração inicial
npx prisma migrate dev --name init_postgresql

# Aplicar migração
npx prisma migrate deploy
```

**💡 Veja `CORRIGIR_MIGRACOES_POSTGRESQL.md` para mais detalhes.**

### 9.5 (Opcional) Popular banco com dados iniciais

```bash
npm run seed
```

## 🏗️ Passo 10: Build do Frontend

### 10.1 Fazer build do frontend

```bash
cd ~/app
npm run build
```

Isso criará a pasta `dist/` com os arquivos estáticos do frontend.

### 10.2 Verificar se o build foi criado

```bash
ls -la ~/app/dist/
```

## 🚀 Passo 11: Configurar PM2

### 11.1 Criar arquivo ecosystem.config.js

```bash
cd ~/app
nano ecosystem.config.js
```

Conteúdo:

```javascript
module.exports = {
  apps: [{
    name: 'central-rnc',
    script: 'npx',
    args: 'tsx api/server.ts',
    cwd: '/root/app',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3006
    },
    error_file: '/root/logs/pm2-error.log',
    out_file: '/root/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false
  }]
};
```

### 11.2 Iniciar aplicação com PM2

```bash
cd ~/app
pm2 start ecosystem.config.js
pm2 save
```

### 11.3 Verificar status

```bash
pm2 status
pm2 logs central-rnc
```

## 🔒 Passo 12: Configurar SSL (Let's Encrypt)

### 12.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 12.2 Obter certificado SSL

```bash
sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
```

Siga as instruções na tela. O Certbot configurará automaticamente o Nginx para usar HTTPS.

### 12.3 Renovação automática

O Certbot já configura renovação automática, mas você pode testar:

```bash
sudo certbot renew --dry-run
```

## ✅ Passo 13: Verificação Final

### 13.1 Verificar serviços

```bash
# PM2
pm2 status

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql

# Node.js
node --version
```

### 13.2 Testar aplicação

```bash
# Verificar se a API está respondendo
curl http://localhost:3006/api/health

# Verificar logs
pm2 logs central-rnc --lines 50
```

### 13.3 Acessar no navegador

- Frontend: `https://central-rnc.com.br`
- Admin: `https://central-rnc.com.br/admin/login`

## 🔄 Passo 14: Scripts de Manutenção

### 14.1 Backup do banco de dados

Crie o script `~/backups/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/central_rnc_$DATE.sql"

pg_dump -U central_rnc_user -h localhost central_rnc > $BACKUP_FILE
gzip $BACKUP_FILE

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "central_rnc_*.sql.gz" -mtime +7 -delete

echo "Backup criado: $BACKUP_FILE.gz"
```

Tornar executável:

```bash
chmod +x ~/backups/backup-db.sh
```

### 14.2 Agendar backup diário

```bash
crontab -e
```

Adicione:

```
0 2 * * * /root/backups/backup-db.sh
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -U central_rnc_user -d central_rnc -h localhost
```

### Erro: "Port 3006 already in use"

```bash
# Verificar processo usando a porta
sudo lsof -i :3006

# Parar PM2 e reiniciar
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js
```

### Erro: "Permission denied" em uploads

```bash
# Corrigir permissões
chown -R root:root /root/app/public/uploads
chmod -R 755 /root/app/public/uploads
```

### Ver logs

```bash
# PM2
pm2 logs central-rnc

# Nginx
sudo tail -f /var/log/nginx/central-rnc-error.log

# Sistema
sudo journalctl -u nginx -f
```

## 📝 Checklist Final

- [ ] Node.js 22 instalado e funcionando
- [ ] PostgreSQL instalado e banco criado
- [ ] PM2 instalado e aplicação rodando
- [ ] Nginx configurado e funcionando
- [ ] SSL/HTTPS configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] Frontend buildado
- [ ] Aplicação acessível via domínio
- [ ] Backups configurados

## 🎉 Pronto!

Sua aplicação está rodando em produção na VPS Hostinger!

---

**💡 Dica:** Use o script `install-vps.sh` para automatizar a instalação (veja próximo arquivo).

