# Script de Deploy para Produção - KingHost
# Execute este script no PowerShell: .\deploy-producao.ps1

$ErrorActionPreference = "Stop"

# Configurações do servidor
$SERVER_HOST = "ftp.central-rnc.com.br"
$SERVER_USER = "central-rnc"
$SERVER_PASS = "gc6j3gtq62"
$SERVER_PATH = "~/public_html"  # Ajuste conforme necessário
$DOMAIN = "central-rnc.com.br"

Write-Host "🚀 Iniciando deploy para produção..." -ForegroundColor Green
Write-Host "📦 Servidor: $SERVER_HOST" -ForegroundColor Cyan
Write-Host "👤 Usuário: $SERVER_USER" -ForegroundColor Cyan
Write-Host ""

# Verificar se o build existe
if (-not (Test-Path "dist")) {
    Write-Host "❌ Erro: Pasta 'dist' não encontrada. Execute 'npm run build' primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build encontrado" -ForegroundColor Green

# Instalar sshpass se necessário (para Windows, pode precisar de ferramentas adicionais)
# Alternativa: usar chave SSH ou autenticação interativa

Write-Host ""
Write-Host "📤 Preparando arquivos para upload..." -ForegroundColor Yellow

# Criar lista de arquivos para upload (excluindo node_modules, .env, etc.)
$filesToUpload = @(
    "api",
    "prisma",
    "public",
    "dist",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html",
    "ecosystem.config.js"
)

Write-Host ""
Write-Host "⚠️  ATENÇÃO: Este script requer acesso SSH configurado." -ForegroundColor Yellow
Write-Host "   Se você não tiver chave SSH configurada, será solicitada a senha." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Próximos passos manuais:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Conecte-se ao servidor via SSH:" -ForegroundColor White
Write-Host "   ssh $SERVER_USER@$SERVER_HOST" -ForegroundColor Gray
Write-Host ""
Write-Host "2. No servidor, execute os seguintes comandos:" -ForegroundColor White
Write-Host ""
Write-Host "   # Navegar para o diretório do projeto" -ForegroundColor Gray
Write-Host "   cd $SERVER_PATH" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Criar diretório se não existir" -ForegroundColor Gray
Write-Host "   mkdir -p site" -ForegroundColor Gray
Write-Host "   cd site" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Instalar dependências" -ForegroundColor Gray
Write-Host "   npm install --production" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Gerar Prisma Client" -ForegroundColor Gray
Write-Host "   npx prisma generate" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Executar migrações" -ForegroundColor Gray
Write-Host "   npx prisma migrate deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Criar diretório de uploads" -ForegroundColor Gray
Write-Host "   mkdir -p public/uploads" -ForegroundColor Gray
Write-Host "   chmod -R 755 public/uploads" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Instalar PM2 globalmente (se não estiver instalado)" -ForegroundColor Gray
Write-Host "   npm install -g pm2 tsx" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Iniciar aplicação com PM2" -ForegroundColor Gray
Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor Gray
Write-Host "   pm2 save" -ForegroundColor Gray
Write-Host "   pm2 startup" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 Para fazer upload dos arquivos, use um dos métodos abaixo:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Método 1 - SCP (do seu computador):" -ForegroundColor White
Write-Host "   scp -r ./api $SERVER_USER@$SERVER_HOST:$SERVER_PATH/site/" -ForegroundColor Gray
Write-Host "   scp -r ./prisma $SERVER_USER@$SERVER_HOST:$SERVER_PATH/site/" -ForegroundColor Gray
Write-Host "   scp -r ./public $SERVER_USER@$SERVER_HOST:$SERVER_PATH/site/" -ForegroundColor Gray
Write-Host "   scp -r ./dist $SERVER_USER@$SERVER_HOST:$SERVER_PATH/site/" -ForegroundColor Gray
Write-Host "   scp ./package.json $SERVER_USER@$SERVER_HOST:$SERVER_PATH/site/" -ForegroundColor Gray
Write-Host "   scp ./package-lock.json $SERVER_USER@$SERVER_HOST:$SERVER_PATH/site/" -ForegroundColor Gray
Write-Host "   scp ./ecosystem.config.js $SERVER_USER@$SERVER_HOST:$SERVER_PATH/site/" -ForegroundColor Gray
Write-Host ""
Write-Host "Método 2 - Git (se o repositório estiver no GitHub):" -ForegroundColor White
Write-Host "   No servidor: git clone https://github.com/SeuUsuario/seu-repositorio.git site" -ForegroundColor Gray
Write-Host ""
Write-Host "Método 3 - FTP/SFTP (use WinSCP, FileZilla ou similar):" -ForegroundColor White
Write-Host "   Host: $SERVER_HOST" -ForegroundColor Gray
Write-Host "   Usuário: $SERVER_USER" -ForegroundColor Gray
Write-Host "   Senha: [sua senha]" -ForegroundColor Gray
Write-Host ""

Write-Host "🔐 IMPORTANTE - Criar arquivo .env no servidor:" -ForegroundColor Yellow
Write-Host "   No servidor, crie o arquivo .env com:" -ForegroundColor White
Write-Host ""
Write-Host "   JWT_SECRET=seu-jwt-secret-super-seguro-aqui" -ForegroundColor Gray
Write-Host "   SMTP_HOST=smtp.gmail.com" -ForegroundColor Gray
Write-Host "   SMTP_PORT=587" -ForegroundColor Gray
Write-Host "   SMTP_USER=seu-email@gmail.com" -ForegroundColor Gray
Write-Host "   SMTP_PASS=sua-senha-app" -ForegroundColor Gray
Write-Host "   PORT=3006" -ForegroundColor Gray
Write-Host "   NODE_ENV=production" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Script de instruções gerado!" -ForegroundColor Green
Write-Host "   Siga as instruções acima para completar o deploy." -ForegroundColor White



