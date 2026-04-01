# 🚀 Deploy para Produção - VPS Hostinger

Este guia descreve o processo completo de deploy para a VPS de produção.

## 📋 Pré-requisitos

- Node.js instalado localmente
- Acesso SSH à VPS
- Arquivo `.env` configurado na VPS

## 🔧 Configurações da VPS

- **IP:** 72.60.155.69
- **Usuário:** root
- **Senha:** SUA_SENHA_VPS_AQUI
- **Domínio:** central-rnc.com.br
- **Diretório:** /root/app
## 📦 Passo a Passo do Deploy

### Opção 1: Script Automatizado (PowerShell)

```powershell
.\deploy-vps-completo.ps1
```

O script irá:
1. ✅ Fazer build do frontend
2. ✅ Enviar arquivos para a VPS
3. ✅ Instalar dependências
4. ✅ Atualizar schema Prisma
5. ✅ Aplicar migrações do banco
6. ✅ Copiar arquivos estáticos
7. ✅ Reiniciar PM2

### Opção 2: Deploy Manual

#### 1. Build Local

```bash
npm run build
```

#### 2. Enviar Arquivos para VPS

```bash
# Usando SCP (Windows PowerShell)
scp -r api root@72.60.155.69:/root/app/
scp -r prisma root@72.60.155.69:/root/app/
scp -r public root@72.60.155.69:/root/app/
scp -r dist root@72.60.155.69:/root/app/
scp package.json root@72.60.155.69:/root/app/
scp package-lock.json root@72.60.155.69:/root/app/
scp ecosystem.config.cjs root@72.60.155.69:/root/app/
```

#### 3. Conectar na VPS e Executar Comandos

```bash
ssh root@72.60.155.69
cd /root/app
```

#### 4. Na VPS - Atualizar Schema e Dependências

```bash
# Fazer backup do schema atual
cp prisma/schema.prisma prisma/schema.prisma.backup

# Substituir pelo schema de produção (PostgreSQL)
cp prisma/schema.production.prisma prisma/schema.prisma

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Aplicar migrações do banco
npx prisma db push --accept-data-loss
# OU
npx prisma migrate deploy
```

#### 5. Copiar Arquivos Estáticos

```bash
# Limpar diretório do Nginx
sudo rm -rf /var/www/central-rnc/*

# Copiar novos arquivos
sudo cp -r dist/* /var/www/central-rnc/

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc
```

#### 6. Reiniciar Aplicação

```bash
# Reiniciar PM2
pm2 restart central-rnc

# OU se não estiver rodando
pm2 start ecosystem.config.cjs --name central-rnc
pm2 save
```

#### 7. Verificar Status

```bash
# Ver status do PM2
pm2 status

# Ver logs
pm2 logs central-rnc --lines 50

# Testar API
curl http://localhost:3006/api/health
```

## 🔄 Atualizações Recentes Incluídas

Este deploy inclui:

- ✅ Módulo de Processos Seletivos completo
- ✅ Gestão de Candidatos com Kanban drag-and-drop
- ✅ Áreas de Interesse (Job Positions)
- ✅ Relatórios e Estatísticas
- ✅ Etapas de Recrutamento
- ✅ Avaliação de Candidatos
- ✅ Sistema de Notas

## 🗄️ Banco de Dados

### Schema de Produção

O arquivo `prisma/schema.production.prisma` contém o schema configurado para PostgreSQL.

**IMPORTANTE:** Certifique-se de que o arquivo `.env` na VPS contém:

```env
DATABASE_URL="postgresql://central_rnc_user:Pkg%40%40gUI4557@localhost:5432/central_rnc?schema=public"
```

### Migrações

As migrações são aplicadas automaticamente durante o deploy. Se houver erro, use:

```bash
npx prisma db push --accept-data-loss
```

## 🐛 Troubleshooting

### Erro: "Port 3006 already in use"

```bash
# Verificar processo
lsof -i :3006
# OU
netstat -tulpn | grep 3006

# Parar processo
pm2 stop central-rnc
pm2 delete central-rnc
```

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
pm2 restart central-rnc
```

### Erro: "Database connection failed"

Verifique:
1. PostgreSQL está rodando: `sudo systemctl status postgresql`
2. `.env` tem a `DATABASE_URL` correta
3. Senha está URL-encoded (`@` vira `%40`)

### Erro: "Permission denied" em uploads

```bash
sudo chown -R www-data:www-data /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads
```

## 📊 Verificação Pós-Deploy

1. ✅ Site carrega: https://central-rnc.com.br
2. ✅ API responde: https://central-rnc.com.br/api/health
3. ✅ Admin funciona: https://central-rnc.com.br/admin
4. ✅ Uploads funcionam
5. ✅ Processos Seletivos aparecem no menu RH

## 🔐 Segurança

- ✅ SSL/HTTPS configurado
- ✅ Senhas em variáveis de ambiente
- ✅ Permissões corretas nos arquivos
- ✅ Firewall configurado

## 📝 Notas

- O deploy não afeta dados existentes no banco
- Uploads são preservados
- Configurações do Nginx são mantidas
- PM2 mantém a aplicação rodando automaticamente

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs: `pm2 logs central-rnc`
2. Verifique o status: `pm2 status`
3. Teste a API localmente: `curl http://localhost:3006/api/health`
4. Verifique o Nginx: `sudo nginx -t`


