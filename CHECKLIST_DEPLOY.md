# ✅ Checklist de Deploy - Kinghost

Use este checklist para garantir que todos os passos do deploy foram executados corretamente.

## 📋 Pré-Deploy (Local)

- [ ] **Backup do banco de dados atual** (se houver dados importantes)
- [ ] **Testar build localmente**
  ```bash
  npm run build
  npm run preview
  ```
- [ ] **Verificar se todas as dependências estão no package.json**
- [ ] **Testar todas as funcionalidades principais**
  - [ ] Login administrativo
  - [ ] CRUD de serviços
  - [ ] CRUD de blog
  - [ ] Formulário de contato
  - [ ] Upload de imagens

## 🗄️ Banco de Dados

- [ ] **Criar banco MySQL na Kinghost**
- [ ] **Anotar credenciais do banco:**
  - [ ] Host
  - [ ] Porta
  - [ ] Nome do banco
  - [ ] Usuário
  - [ ] Senha
- [ ] **Atualizar DATABASE_URL no .env**
  ```
  DATABASE_URL="mysql://usuario:senha@host:porta/nome_banco"
  ```

## ⚙️ Configurações

- [ ] **Criar arquivo .env no servidor** (baseado no .env.example)
- [ ] **Configurar variáveis obrigatórias:**
  - [ ] `JWT_SECRET` (gerar valor aleatório seguro)
  - [ ] `DATABASE_URL` (string de conexão MySQL)
  - [ ] `BASE_URL` (URL do site em produção)
  - [ ] `NODE_ENV=production`
- [ ] **Configurar variáveis opcionais:**
  - [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (para emails)
  - [ ] Configurações de redes sociais (se necessário)

## 📦 Build e Upload

- [ ] **Executar build local:**
  ```bash
  npm run build
  ```
- [ ] **Verificar se a pasta `dist/` foi criada**
- [ ] **Fazer upload dos arquivos para o servidor:**
  - [ ] Pasta `api/` (completa)
  - [ ] Pasta `prisma/` (completa)
  - [ ] Pasta `dist/` (build do frontend)
  - [ ] Pasta `public/` (uploads, etc)
  - [ ] Arquivos raiz: `package.json`, `package-lock.json`, `.env`, `.htaccess`
  - [ ] Arquivos de configuração: `tsconfig.json`, `nodemon.json`

## 🔧 Configuração no Servidor

- [ ] **Conectar ao servidor via SSH/FTP**
- [ ] **Instalar dependências:**
  ```bash
  npm install --production
  ```
- [ ] **Gerar Prisma Client:**
  ```bash
  npx prisma generate
  ```
- [ ] **Executar migrações:**
  ```bash
  npx prisma migrate deploy
  ```
- [ ] **Popular banco (opcional):**
  ```bash
  npm run seed
  ```

## 🌐 Servidor Web

- [ ] **Verificar se o arquivo `.htaccess` está na raiz**
- [ ] **Configurar proxy reverso** (se necessário, conforme documentação da Kinghost)
- [ ] **Verificar permissões de arquivos:**
  - [ ] Pasta `public/uploads/` com permissão de escrita
  - [ ] Arquivos com permissões corretas (644 para arquivos, 755 para pastas)

## 🚀 Process Manager

- [ ] **Instalar PM2 (se necessário):**
  ```bash
  npm install -g pm2
  ```
- [ ] **Iniciar aplicação:**
  ```bash
  pm2 start api/server.js --name "central-contabil-api"
  pm2 save
  pm2 startup
  ```
- [ ] **Ou configurar serviço systemd** (se a Kinghost suportar)

## ✅ Testes Pós-Deploy

- [ ] **Acessar site principal:**
  - [ ] URL: `https://seudominio.com.br`
  - [ ] Site carrega corretamente
  - [ ] Imagens carregam
  - [ ] CSS/JS carregam
- [ ] **Testar API:**
  - [ ] `https://seudominio.com.br/api/health` retorna OK
  - [ ] `https://seudominio.com.br/api/configurations` funciona
- [ ] **Testar área administrativa:**
  - [ ] Acessar: `https://seudominio.com.br/admin/login`
  - [ ] Fazer login
  - [ ] Verificar se todas as páginas carregam
- [ ] **Testar funcionalidades:**
  - [ ] Upload de imagens
  - [ ] Criação/edição de conteúdo
  - [ ] Formulário de contato
  - [ ] Newsletter
- [ ] **Verificar logs:**
  - [ ] Sem erros no console do navegador
  - [ ] Sem erros nos logs do servidor

## 🔒 Segurança

- [ ] **Verificar se o arquivo `.env` não está acessível publicamente**
- [ ] **Verificar se arquivos sensíveis estão no .gitignore**
- [ ] **Configurar HTTPS/SSL** (se ainda não estiver)
- [ ] **Verificar headers de segurança** (via .htaccess)

## 📊 Monitoramento

- [ ] **Configurar monitoramento** (se disponível na Kinghost)
- [ ] **Configurar backups automáticos do banco de dados**
- [ ] **Configurar alertas de erro** (se possível)

## 📝 Documentação

- [ ] **Anotar credenciais importantes** (em local seguro)
- [ ] **Documentar configurações específicas** da Kinghost
- [ ] **Criar documentação de manutenção**

## 🎉 Finalização

- [ ] **Testar em diferentes navegadores**
- [ ] **Testar em dispositivos móveis**
- [ ] **Verificar performance**
- [ ] **Comunicar lançamento** (se aplicável)

---

## 🆘 Em caso de problemas

1. Verificar logs do servidor
2. Verificar logs do PM2: `pm2 logs`
3. Verificar configurações do .env
4. Verificar conexão com banco de dados
5. Consultar documentação da Kinghost
6. Consultar `DEPLOY_KINGHOST.md` para troubleshooting

