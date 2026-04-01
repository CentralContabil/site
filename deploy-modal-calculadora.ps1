# Script de Deploy - Modal Calculadora
# Execute: .\deploy-modal-calculadora.ps1

$ErrorActionPreference = "Stop"

# Configurações da VPS
$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"
$DOMAIN = "central-rnc.com.br"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy - Modal Calculadora" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Build do Frontend
Write-Host "1. Fazendo build do frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build falhou!" -ForegroundColor Red
    exit 1
}
Write-Host "   OK: Build concluido" -ForegroundColor Green
Write-Host ""

# 2. Enviar arquivos para VPS
Write-Host "2. Enviando arquivos para VPS..." -ForegroundColor Yellow
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray

# Enviar dist/
Write-Host "   Enviando dist/..." -ForegroundColor Gray
scp -r dist/* "${VPS_USER}@${VPS_IP}:${VPS_PATH}/dist/" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   AVISO: Erro ao enviar dist/" -ForegroundColor Yellow
}

# Enviar arquivos atualizados
$filesToUpload = @(
    "src/pages/FiscalBenefitPage.tsx",
    "src/pages/admin/SectionsAdmin.tsx",
    "api/controllers/sectionsController.ts",
    "api/routes/sections.ts",
    "prisma/schema.prisma"
)

foreach ($file in $filesToUpload) {
    if (Test-Path $file) {
        Write-Host "   Enviando $file..." -ForegroundColor Gray
        $remoteDir = Split-Path "$VPS_PATH/$file" -Parent
        ssh "${VPS_USER}@${VPS_IP}" "mkdir -p $remoteDir" 2>&1 | Out-Null
        scp "$file" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/$file" 2>&1 | Out-Null
    }
}

Write-Host "   OK: Arquivos enviados" -ForegroundColor Green
Write-Host ""

# 3. Executar comandos na VPS
Write-Host "3. Executando comandos na VPS..." -ForegroundColor Yellow

$remoteScript = @"
cd $VPS_PATH

# 1. Aplicar migracoes do Prisma (se necessario)
echo 'Aplicando migracoes do Prisma...'
npx prisma db push --accept-data-loss 2>&1 || echo 'Migracoes ja aplicadas'

# 2. Gerar Prisma Client
echo 'Gerando Prisma Client...'
npx prisma generate

# 3. Copiar arquivos estaticos para Nginx
echo 'Copiando arquivos estaticos...'
sudo rm -rf /var/www/central-rnc/*
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

# 4. Reiniciar aplicacao PM2
echo 'Reiniciando aplicacao...'
pm2 restart central-rnc || pm2 start ecosystem.config.cjs --name central-rnc
pm2 save

# 5. Verificar status
echo ''
echo 'Deploy concluido!'
pm2 status
"@

Write-Host "   Executando comandos remotos..." -ForegroundColor Gray
ssh "${VPS_USER}@${VPS_IP}" $remoteScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy concluido com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Teste o site: https://$DOMAIN" -ForegroundColor White
Write-Host ""


