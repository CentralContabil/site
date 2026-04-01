# 📋 Próximos Passos do Deploy

## ✅ Concluído
- [x] Schema Prisma configurado para PostgreSQL
- [x] Prisma Client gerado
- [x] `npx prisma db push` executado com sucesso (usuário como superusuário temporariamente)

## 🔄 Próximos Passos

### 1. Popular banco com dados iniciais (Seed)

```bash
cd ~/app
npm run seed
```

Isso criará:
- 2 administradores:
  - Email: `sistema@central-rnc.com.br` / Senha: `admin123`
  - Email: `wagner.guerra@gmail.com` / Senha: `admin123`
- Configurações padrão da empresa
- Slides, serviços e depoimentos de exemplo

### 2. Build do Frontend

```bash
cd ~/app
npm run build
```

Isso criará a pasta `dist/` com os arquivos estáticos do frontend.

**Verificar se o build foi criado:**
```bash
ls -la ~/app/dist/
```

### 3. Configurar PM2

**3.1 Criar arquivo ecosystem.config.js** (se ainda não existir)

```bash
cd ~/app
nano ecosystem.config.js
```

**3.2 Iniciar aplicação com PM2**

```bash
cd ~/app
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Se ainda não configurado
```

**3.3 Verificar status**

```bash
pm2 status
pm2 logs central-rnc
```

### 4. Configurar Nginx (se ainda não configurado)

**4.1 Criar configuração**

```bash
sudo nano /etc/nginx/sites-available/central-rnc
```

**4.2 Ativar configuração**

```bash
sudo ln -s /etc/nginx/sites-available/central-rnc /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

### 5. Configurar SSL/HTTPS (Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
```

### 6. Remover Privilégio de Superusuário (Ao Final)

**⚠️ IMPORTANTE:** Execute apenas após confirmar que tudo está funcionando!

```bash
sudo -u postgres psql <<EOF
ALTER USER central_rnc_user WITH NOSUPERUSER;
\q
EOF
```

Ou use o script automatizado:
```bash
bash remover-superuser.sh
```

---

## 🧪 Verificações Finais

Após concluir todos os passos, verifique:

1. **Aplicação rodando:**
   ```bash
   pm2 status
   ```

2. **Nginx funcionando:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Acessar o site:**
   - Frontend: `https://central-rnc.com.br`
   - Admin: `https://central-rnc.com.br/admin`

4. **Logs (se houver problemas):**
   ```bash
   pm2 logs central-rnc --lines 50
   sudo tail -f /var/log/nginx/central-rnc-error.log
   ```

---

## 📝 Checklist Final

- [ ] Seed executado com sucesso
- [ ] Build do frontend concluído
- [ ] PM2 configurado e aplicação rodando
- [ ] Nginx configurado e funcionando
- [ ] SSL/HTTPS configurado
- [ ] Site acessível via HTTPS
- [ ] Área administrativa funcionando
- [ ] Privilégio de superusuário removido (após tudo funcionar)


