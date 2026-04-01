# 🚀 Deploy - Modal Calculadora

## Passos para Publicar na VPS

### 1. Build do Frontend (Local)

```powershell
npm run build
```

### 2. Enviar Arquivos para VPS

**Opção A: Usar o script completo (recomendado)**
```powershell
.\deploy-vps-completo.ps1
```

**Opção B: Enviar manualmente**

```powershell
# Enviar dist/
scp -r dist/* root@72.60.155.69:/root/app/dist/

# Enviar arquivos atualizados
scp src/pages/FiscalBenefitPage.tsx root@72.60.155.69:/root/app/src/pages/
scp src/pages/admin/SectionsAdmin.tsx root@72.60.155.69:/root/app/src/pages/admin/
scp api/controllers/sectionsController.ts root@72.60.155.69:/root/app/api/controllers/
scp api/routes/sections.ts root@72.60.155.69:/root/app/api/routes/
scp prisma/schema.prisma root@72.60.155.69:/root/app/prisma/
```

**Senha:** `SUA_SENHA_VPS_AQUI`

### 3. Executar Comandos na VPS

Conecte via SSH:
```powershell
ssh root@72.60.155.69
# Senha: SUA_SENHA_VPS_AQUI
```

Execute os comandos:
```bash
cd /root/app

# 1. Aplicar migrações do Prisma (nova tabela SectionFiscalBenefitsConfig)
npx prisma db push --accept-data-loss

# 2. Gerar Prisma Client
npx prisma generate

# 3. Copiar arquivos estáticos para Nginx
sudo rm -rf /var/www/central-rnc/*
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

# 4. Reiniciar aplicação PM2
pm2 restart central-rnc
pm2 save

# 5. Verificar status
pm2 status
```

### 4. Verificar se Funcionou

1. Acesse: https://central-rnc.com.br/beneficios-fiscais/[slug-do-beneficio]
2. Clique no botão "Acessar Calculadora"
3. O modal deve abrir suavemente com o iframe carregando

## ✅ Checklist

- [ ] Build feito localmente
- [ ] Arquivos enviados para VPS
- [ ] Migrações do Prisma aplicadas
- [ ] Prisma Client gerado
- [ ] Arquivos estáticos copiados para Nginx
- [ ] PM2 reiniciado
- [ ] Testado no site

## 🐛 Se Algo Der Errado

**Verificar logs do PM2:**
```bash
pm2 logs central-rnc --lines 50
```

**Verificar logs do Nginx:**
```bash
sudo tail -f /var/log/nginx/central-rnc-error.log
```

**Verificar se a API está respondendo:**
```bash
curl https://central-rnc.com.br/api/sections/fiscal-benefits/config
```


