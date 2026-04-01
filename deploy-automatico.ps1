# Script de Deploy Automatizado para Produção - KingHost
# Execute: .\deploy-automatico.ps1

param(
    [string]$ServerPath = "~/public_html/site"
)

$ErrorActionPreference = "Continue"

# Configurações
$SERVER_HOST = "ftp.central-rnc.com.br"
$SERVER_USER = "central-rnc"
$SERVER_PASS = "gc6j3gtq62"
$DOMAIN = "central-rnc.com.br"

Write-Host "🚀 Deploy Automatizado para Produção" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Verificar build
if (-not (Test-Path "dist")) {
    Write-Host "❌ Erro: Execute 'npm run build' primeiro!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build encontrado" -ForegroundColor Green
Write-Host ""

# Função para fazer upload via SCP
function Upload-File {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    $scpCommand = "scp -r `"$LocalPath`" ${SERVER_USER}@${SERVER_HOST}:${RemotePath}"
    Write-Host "📤 Enviando: $LocalPath" -ForegroundColor Yellow
    
    try {
        # Tentar executar SCP (pode pedir senha)
        & cmd /c "echo $SERVER_PASS | scp -r `"$LocalPath`" ${SERVER_USER}@${SERVER_HOST}:${RemotePath}"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Upload concluído: $LocalPath" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "⚠️  Upload falhou (será necessário fazer manualmente): $LocalPath" -ForegroundColor Yellow
    }
    return $false
}

Write-Host "📋 Tentando fazer upload dos arquivos..." -ForegroundColor Cyan
Write-Host "   (Você pode precisar inserir a senha manualmente)" -ForegroundColor Yellow
Write-Host ""

# Lista de arquivos/pastas para upload
$uploads = @(
    @{Local="api"; Remote="$ServerPath/"},
    @{Local="prisma"; Remote="$ServerPath/"},
    @{Local="public"; Remote="$ServerPath/"},
    @{Local="dist"; Remote="$ServerPath/"},
    @{Local="package.json"; Remote="$ServerPath/"},
    @{Local="package-lock.json"; Remote="$ServerPath/"},
    @{Local="ecosystem.config.js"; Remote="$ServerPath/"},
    @{Local="tsconfig.json"; Remote="$ServerPath/"},
    @{Local="vite.config.ts"; Remote="$ServerPath/"},
    @{Local="tailwind.config.js"; Remote="$ServerPath/"},
    @{Local="postcss.config.js"; Remote="$ServerPath/"},
    @{Local="index.html"; Remote="$ServerPath/"}
)

$successCount = 0
$failCount = 0

foreach ($item in $uploads) {
    if (Test-Path $item.Local) {
        $result = Upload-File -LocalPath $item.Local -RemotePath $item.Remote
        if ($result) {
            $successCount++
        } else {
            $failCount++
        }
    } else {
        Write-Host "⚠️  Arquivo não encontrado: $($item.Local)" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host ""
Write-Host "📊 Resumo do Upload:" -ForegroundColor Cyan
Write-Host "   ✅ Sucesso: $successCount" -ForegroundColor Green
Write-Host "   ❌ Falhas: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "⚠️  Alguns uploads falharam. Use os comandos manuais abaixo:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($item in $uploads) {
        if (Test-Path $item.Local) {
            Write-Host "scp -r `"$($item.Local)`" ${SERVER_USER}@${SERVER_HOST}:$($item.Remote)" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

Write-Host "🔧 Próximo passo: Conectar ao servidor e configurar" -ForegroundColor Cyan
Write-Host ""
Write-Host "Execute no servidor (via SSH):" -ForegroundColor White
Write-Host ""
Write-Host "ssh $SERVER_USER@$SERVER_HOST" -ForegroundColor Gray
Write-Host "cd $ServerPath" -ForegroundColor Gray
Write-Host "npm install --production" -ForegroundColor Gray
Write-Host "npx prisma generate" -ForegroundColor Gray
Write-Host "npx prisma migrate deploy" -ForegroundColor Gray
Write-Host "mkdir -p public/uploads && chmod -R 755 public/uploads" -ForegroundColor Gray
Write-Host "npm install -g pm2 tsx" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 Criar arquivo .env:" -ForegroundColor Yellow
Write-Host "nano .env" -ForegroundColor Gray
Write-Host ""
Write-Host "Conteúdo do .env:" -ForegroundColor White
Write-Host "JWT_SECRET=seu-jwt-secret-super-seguro-aqui" -ForegroundColor Gray
Write-Host "SMTP_HOST=smtp.gmail.com" -ForegroundColor Gray
Write-Host "SMTP_PORT=587" -ForegroundColor Gray
Write-Host "SMTP_USER=seu-email@gmail.com" -ForegroundColor Gray
Write-Host "SMTP_PASS=sua-senha-app" -ForegroundColor Gray
Write-Host "PORT=3006" -ForegroundColor Gray
Write-Host "NODE_ENV=production" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Iniciar aplicação:" -ForegroundColor Cyan
Write-Host "pm2 start ecosystem.config.js" -ForegroundColor Gray
Write-Host "pm2 save" -ForegroundColor Gray
Write-Host "pm2 startup" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green



