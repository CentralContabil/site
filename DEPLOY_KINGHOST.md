# 🚀 Guia de Deploy - Kinghost

Este guia contém todas as instruções necessárias para fazer o deploy do site na Kinghost.

## 📋 Pré-requisitos

1. Conta na Kinghost com acesso ao painel
2. Domínio configurado (ou subdomínio)
3. Banco de dados MySQL criado no painel da Kinghost
4. Node.js instalado (versão 18 ou superior) - verificar se a Kinghost suporta

## 🔧 Passo 1: Preparar o Banco de Dados

### 1.1 Criar Banco de Dados MySQL na Kinghost

1. Acesse o painel da Kinghost
2. Vá em "Bancos de Dados" ou "MySQL"
3. Crie um novo banco de dados MySQL
4. Anote as credenciais:
   - Host (geralmente `mysql.kinghost.net` ou similar)
   - Porta (geralmente `3306`)
   - Nome do banco
   - Usuário
   - Senha

### 1.2 Atualizar Schema do Prisma

O projeto está configurado para SQLite em desenvolvimento. Para produção na Kinghost, precisamos usar MySQL.

**Opção A: Usar variável de ambiente (Recomendado)**

O schema do Prisma já está configurado para usar a variável `DATABASE_URL`. Basta configurá-la no `.env`.

**Opção B: Atualizar schema.prisma diretamente**

Se preferir, você pode atualizar o `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 📦 Passo 2: Configurar Variáveis de Ambiente

1. No painel da Kinghost, localize onde configurar variáveis de ambiente
2. Ou crie um arquivo `.env` na raiz do projeto com base no `.env.example`
3. Configure todas as variáveis necessárias (veja `.env.example`)

**Variáveis Obrigatórias:**
- `JWT_SECRET` - Gere um valor aleatório seguro
- `DATABASE_URL` - String de conexão MySQL da Kinghost
- `BASE_URL` - URL do seu site (ex: `https://seudominio.com.br`)

**Variáveis Opcionais:**
- `SMTP_*` - Para envio de emails
- Configurações de redes sociais

## 🏗️ Passo 3: Build do Projeto

### 3.1 Build do Frontend

```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos estáticos do frontend.

### 3.2 Preparar Backend

O backend já está pronto, mas certifique-se de:

1. Gerar o Prisma Client:
```bash
npx prisma generate
```

2. Executar migrações:
```bash
npx prisma migrate deploy
```

## 📤 Passo 4: Upload para Kinghost

### 4.1 Estrutura de Arquivos

Faça upload dos seguintes arquivos/pastas:

```
/
├── api/                    # Pasta completa do backend
├── prisma/                 # Schema e migrações
├── dist/                   # Build do frontend (após npm run build)
├── public/                 # Arquivos estáticos (uploads, etc)
├── package.json
├── package-lock.json
├── .env                    # Variáveis de ambiente (NÃO commitar no Git)
├── tsconfig.json
└── nodemon.json
```

### 4.2 Via FTP/SFTP

1. Conecte-se ao servidor da Kinghost via FTP/SFTP
2. Faça upload de todos os arquivos para a pasta raiz do domínio (geralmente `public_html` ou `www`)

### 4.3 Via Git (se a Kinghost suportar)

1. Configure o repositório Git no painel da Kinghost
2. Faça push do código
3. Configure o comando de build automático (se disponível)

## ⚙️ Passo 5: Configurar Servidor

### 5.1 Instalar Dependências

No servidor da Kinghost, execute:

```bash
npm install --production
```

### 5.2 Configurar Prisma

```bash
npx prisma generate
npx prisma migrate deploy
```

### 5.3 Popular Banco de Dados (Opcional)

Se quiser dados iniciais:

```bash
npm run seed
```

## 🌐 Passo 6: Configurar Servidor Web

### 6.1 Arquivo .htaccess (Apache)

Crie um arquivo `.htaccess` na raiz do projeto:

```apache
# Habilitar rewrite engine
RewriteEngine On

# Redirecionar todas as requisições para o servidor Node.js
# (Ajuste a porta conforme configurado na Kinghost)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ http://localhost:3006/api/$1 [P,L]

# Servir arquivos estáticos do frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /dist/index.html [L]
```

### 6.2 Configurar Proxy Reverso

Se a Kinghost usar Nginx ou outro servidor, configure proxy reverso:

**Nginx:**
```nginx
location /api {
    proxy_pass http://localhost:3006;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location / {
    root /caminho/para/dist;
    try_files $uri $uri/ /index.html;
}
```

## 🔄 Passo 7: Configurar Process Manager

Para manter o servidor Node.js rodando, use PM2 ou similar:

```bash
npm install -g pm2
pm2 start api/server.ts --name "central-contabil-api"
pm2 save
pm2 startup
```

## ✅ Passo 8: Verificar Deploy

1. Acesse seu domínio no navegador
2. Verifique se o site carrega corretamente
3. Teste a área administrativa: `https://seudominio.com.br/admin/login`
4. Verifique se as APIs estão funcionando: `https://seudominio.com.br/api/health`

## 🔍 Troubleshooting

### Erro: "Cannot find module"
- Execute `npm install` no servidor
- Execute `npx prisma generate`

### Erro: "Database connection failed"
- Verifique a `DATABASE_URL` no `.env`
- Confirme que o banco MySQL está acessível
- Verifique firewall/portas

### Erro: "Port already in use"
- Verifique qual porta a Kinghost disponibiliza
- Ajuste a variável `PORT` no `.env`

### Frontend não carrega
- Verifique se a pasta `dist/` foi enviada
- Verifique configurações do `.htaccess` ou Nginx
- Verifique permissões de arquivos

## 📞 Suporte

Para dúvidas sobre configuração na Kinghost, consulte a documentação deles ou entre em contato com o suporte.

