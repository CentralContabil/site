# Sincronização Completa: Localhost -> VPS

Este documento explica como sincronizar todos os arquivos e o banco de dados do localhost para a VPS.

## 📋 Pré-requisitos

### 1. Ferramentas SSH

O script funciona com qualquer uma das seguintes opções:

**Opção A: PuTTY (Recomendado para Windows)**
```powershell
choco install putty
```
Ou baixe manualmente: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html

**Opção B: OpenSSH (Já vem com Windows 10/11)**
- Verifique se está instalado: `ssh -V`
- Se não estiver, instale via: Configurações > Aplicativos > Recursos Opcionais > OpenSSH

**Opção C: Git for Windows (Inclui SSH)**
- Baixe em: https://git-scm.com/download/win

**Opção D: sshpass (Linux/WSL/Git Bash)**
```bash
# No Git Bash ou WSL
sudo apt-get install sshpass
```

### 2. Senha da VPS

A senha está configurada no script: `SUA_SENHA_VPS_AQUI`

- Se usar PuTTY: A senha será passada automaticamente
- Se usar OpenSSH sem sshpass: Você precisará informar a senha quando solicitado

## 🚀 Como Usar

### Sincronização Completa (Recomendado)

Execute o script completo que faz tudo automaticamente:

**Para Windows (recomendado):**
```powershell
.\sincronizar-completo-vps-windows.ps1
```

**Para Linux/Mac ou com sshpass:**
```powershell
.\sincronizar-completo-vps.ps1
```

Este script:
1. ✅ Faz build do frontend
2. ✅ Exporta o banco de dados local
3. ✅ Envia todos os arquivos para a VPS
4. ✅ Importa o banco de dados na VPS
5. ✅ Aplica migrações
6. ✅ Corrige permissões de uploads
7. ✅ Configura o Nginx
8. ✅ Reinicia os serviços

### O que o script faz:

#### No Localhost:
- Faz build do frontend (`npm run build`)
- Exporta todos os dados do banco local para JSON (`exportar-dados-local.js`)
- Envia todos os arquivos para a VPS via SCP

#### Na VPS:
- Atualiza o schema do Prisma para PostgreSQL
- Instala dependências (`npm install`)
- Gera o Prisma Client
- Aplica migrações do banco (`npx prisma db push`)
- Importa dados do banco local (`importar-dados-vps.js`)
- Copia arquivos estáticos para o Nginx
- Corrige permissões da pasta `uploads`
- Configura o Nginx para servir `/uploads`
- Reinicia a aplicação PM2

## 📁 Arquivos Sincronizados

O script sincroniza:
- `api/` - Código do backend
- `prisma/` - Schema e migrações
- `public/` - Arquivos estáticos (incluindo uploads)
- `dist/` - Build do frontend
- `dados_exportados/` - Dados do banco exportados
- Arquivos de configuração (`package.json`, `tsconfig.json`, etc.)

## 🗄️ Tabelas Sincronizadas

O banco de dados sincroniza todas as tabelas, incluindo:
- Configurações
- Slides
- Serviços
- Depoimentos
- Blog Posts, Categorias e Tags
- Hero, Seções (Features, About, etc.)
- Privacy Policy, Login Page, Careers Page
- Clientes
- Newsletter Subscriptions
- Contact Messages
- Job Positions e Applications
- **Landing Pages** (novo)
- **Forms** (novo)
- **Form Submissions** (novo)
- **Section Fiscal Benefits Config** (novo)

## ⚠️ Observações Importantes

1. **Backup**: O script faz backup automático do schema antes de atualizar
2. **Dados**: Os dados são importados usando `upsert`, então registros existentes são atualizados
3. **Uploads**: A pasta `uploads` é copiada para `/var/www/central-rnc/uploads` e as permissões são ajustadas
4. **Nginx**: O script configura automaticamente o Nginx para servir `/uploads`
5. **PM2**: A aplicação é reiniciada automaticamente após a sincronização

## 🔍 Verificar se Funcionou

Após executar o script, verifique:

```bash
# Status da aplicação
ssh root@72.60.155.69 'pm2 status'

# Logs da aplicação
ssh root@72.60.155.69 'pm2 logs central-rnc --lines 50'

# Testar API
curl https://central-rnc.com.br/api/health

# Acessar o site
# https://central-rnc.com.br
```

## 🐛 Solução de Problemas

### Erro: "SSH ou SCP não encontrados"
- Instale OpenSSH via Configurações do Windows
- Ou instale Git for Windows (inclui SSH)
- Ou instale PuTTY

### Erro: "sshpass não encontrado" (Windows)
- Use o script `sincronizar-completo-vps-windows.ps1` que funciona sem sshpass
- Ou instale PuTTY: `choco install putty`
- Ou informe a senha manualmente quando solicitado (senha: `SUA_SENHA_VPS_AQUI`)

### Erro: "Falha na exportação do banco"
- Verifique se o banco local está funcionando
- Execute `npx prisma generate` localmente
- Verifique se o arquivo `.env` está configurado

### Erro: "Falha na importação do banco"
- Verifique os logs na VPS: `ssh root@72.60.155.69 'pm2 logs central-rnc'`
- Verifique se o schema de produção está correto
- Verifique se o banco PostgreSQL na VPS está acessível

### Arquivos de upload não aparecem
- Execute o script de correção: `.\corrigir-tudo-uploads.ps1`
- Verifique as permissões: `ssh root@72.60.155.69 'ls -la /var/www/central-rnc/uploads'`

## 📝 Scripts Disponíveis

- `sincronizar-completo-vps.ps1` - Sincronização completa (recomendado)
- `deploy-vps-completo.ps1` - Deploy apenas de código (sem banco)
- `corrigir-tudo-uploads.ps1` - Corrige apenas permissões de uploads
- `exportar-dados-local.js` - Exporta banco local
- `importar-dados-vps.js` - Importa banco na VPS

