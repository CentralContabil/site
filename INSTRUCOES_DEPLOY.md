# 📋 Instruções de Deploy para Produção

## 🚀 Deploy Rápido (Recomendado)

Execute o script automatizado:

```powershell
.\deploy-vps-completo.ps1
```

## 📦 O que será feito:

1. ✅ Build do frontend (`npm run build`)
2. ✅ Upload de todos os arquivos necessários para a VPS
3. ✅ Atualização do schema Prisma para PostgreSQL
4. ✅ Instalação de dependências na VPS
5. ✅ Geração do Prisma Client
6. ✅ Aplicação de migrações do banco de dados
7. ✅ Cópia de arquivos estáticos para Nginx
8. ✅ Reinicialização do PM2

## 🔧 Configurações

- **VPS IP:** 72.60.155.69
- **Usuário:** root
- **Senha:** SUA_SENHA_VPS_AQUI
- **Domínio:** central-rnc.com.br
- **Diretório:** /root/app

## ⚠️ Importante

### Antes do Deploy:

1. **Verifique se o build funciona localmente:**
   ```bash
   npm run build
   ```

2. **Verifique se não há erros de TypeScript:**
   ```bash
   npm run check
   ```

3. **Certifique-se de que o `.env` na VPS está correto:**
   - `DATABASE_URL` com senha URL-encoded (`@` = `%40`)
   - `JWT_SECRET` configurado
   - Outras variáveis necessárias

### Após o Deploy:

1. **Verifique os logs:**
   ```bash
   ssh root@72.60.155.69 'pm2 logs central-rnc --lines 50'
   ```

2. **Teste a API:**
   ```bash
   curl https://central-rnc.com.br/api/health
   ```

3. **Acesse o site:**
   - https://central-rnc.com.br
   - https://central-rnc.com.br/admin

## 🆘 Troubleshooting

### Erro: "Cannot connect to database"

Verifique:
- PostgreSQL está rodando: `sudo systemctl status postgresql`
- `.env` tem `DATABASE_URL` correta
- Senha está URL-encoded

### Erro: "Port 3006 already in use"

```bash
pm2 stop central-rnc
pm2 delete central-rnc
pm2 start ecosystem.config.cjs --name central-rnc
```

### Erro: "Prisma Client not found"

```bash
cd /root/app
npx prisma generate
pm2 restart central-rnc
```

## 📊 Verificação Pós-Deploy

- [ ] Site carrega corretamente
- [ ] API responde (`/api/health`)
- [ ] Admin funciona
- [ ] Uploads funcionam
- [ ] Processos Seletivos aparecem no menu RH
- [ ] Kanban de candidatos funciona
- [ ] Relatórios carregam

## 🔄 Sincronização de Dados

Se precisar sincronizar dados do banco local para produção:

1. **Exportar dados locais:**
   ```bash
   node exportar-dados-local.js
   ```

2. **Enviar para VPS:**
   ```bash
   scp -r dados_exportados root@72.60.155.69:/root/app/
   ```

3. **Importar na VPS:**
   ```bash
   ssh root@72.60.155.69
   cd /root/app
   node importar-dados-vps.js
   ```

## 📝 Notas

- O deploy **NÃO** apaga dados existentes
- Uploads são preservados
- Configurações do Nginx são mantidas
- PM2 mantém a aplicação rodando automaticamente


