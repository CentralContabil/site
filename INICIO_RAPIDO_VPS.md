# 🚀 Início Rápido - Deploy VPS Hostinger

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

## 📋 Resumo dos Arquivos Criados

1. **`DEPLOY_VPS_HOSTINGER.md`** - Guia completo passo a passo
2. **`install-vps.sh`** - Script de instalação automatizada
3. **`deploy-vps.sh`** - Script de deploy automatizado
4. **`prisma/schema.production.prisma`** - Schema Prisma para PostgreSQL
5. **`ecosystem.vps.config.js`** - Configuração PM2 para VPS
6. **`nginx-central-rnc.conf`** - Configuração Nginx

## ⚡ Início Rápido (3 Passos)

### 1️⃣ Instalação Inicial (Execute na VPS)

```bash
# Fazer upload do arquivo install-vps.sh para a VPS
# OU clonar o repositório na VPS

# Tornar executável e executar
chmod +x install-vps.sh
bash install-vps.sh
```

Este script instala:
- ✅ Node.js 22 (via NVM)
- ✅ PostgreSQL
- ✅ PM2
- ✅ Nginx
- ✅ Cria estrutura de diretórios
- ✅ Cria arquivo .env de exemplo
- ✅ Cria script de backup

### 2️⃣ Configurar Ambiente

```bash
# Editar arquivo .env
nano ~/app/.env

# Configurar:
# - DATABASE_URL (com senha do PostgreSQL)
# - SMTP_HOST, SMTP_USER, SMTP_PASS
# - APP_URL (https://central-rnc.com.br)
```

### 3️⃣ Fazer Upload dos Arquivos e Deploy

**Opção A: Via Git (Recomendado)**
```bash
cd ~/app
git clone https://github.com/seu-usuario/seu-repo.git .
# OU se já tiver o repositório
git pull origin main
```

**Opção B: Via SCP (do seu computador)**
```bash
# No seu computador local
# IP da VPS: 72.60.155.69
# Senha: SUA_SENHA_VPS_AQUI

# Enviar arquivos principais
scp -r ./api ./prisma ./public ./package.json ./package-lock.json ./tsconfig.json ./vite.config.ts ./tailwind.config.js ./postcss.config.js ./index.html root@72.60.155.69:/root/app/

# Enviar diretório src/ (obrigatório para build)
scp -r ./src root@72.60.155.69:/root/app/

# Com sshpass (Linux/Mac - evita digitar senha):
sshpass -p 'SUA_SENHA_VPS_AQUI' scp -r ./api ./src ./prisma ./public ./package.json ./package-lock.json ./tsconfig.json ./vite.config.ts ./tailwind.config.js ./postcss.config.js ./index.html root@72.60.155.69:/root/app/
```

**Depois, na VPS:**
```bash
cd ~/app

# Copiar schema de produção
cp prisma/schema.production.prisma prisma/schema.prisma

# Executar deploy
chmod +x deploy-vps.sh
bash deploy-vps.sh
```

## 🔧 Configuração Adicional

### Configurar Nginx

```bash
# Copiar configuração (já está configurado para central-rnc.com.br e root)
sudo cp nginx-central-rnc.conf /etc/nginx/sites-available/central-rnc

# Ativar
sudo ln -s /etc/nginx/sites-available/central-rnc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Configurar SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
```

## ✅ Verificação

```bash
# Verificar PM2
pm2 status
pm2 logs central-rnc

# Verificar Nginx
sudo systemctl status nginx

# Verificar PostgreSQL
sudo systemctl status postgresql

# Testar API
curl http://localhost:3006/api/health
```

## 📚 Documentação Completa

Veja **`DEPLOY_VPS_HOSTINGER.md`** para o guia completo com todos os detalhes.

## 🆘 Problemas Comuns

### Erro: "Cannot connect to database"
- Verifique se PostgreSQL está rodando: `sudo systemctl status postgresql`
- Verifique a senha no `.env`
- Teste conexão: `psql -U central_rnc_user -d central_rnc -h localhost`

### Erro: "Port 3006 already in use"
```bash
pm2 stop all
pm2 delete all
pm2 start ecosystem.vps.config.js
```

### Erro: "Permission denied" em uploads
```bash
chown -R root:root /root/app/public/uploads
chmod -R 755 /root/app/public/uploads
```

---

**🎉 Pronto!** Sua aplicação está rodando na VPS!

