# Script para Sincronizar Áreas de Interesse (Job Positions) para VPS
# Execute: .\sincronizar-job-positions.ps1

$ErrorActionPreference = "Stop"

# Configurações da VPS
$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "Sincronizando Areas de Interesse para VPS..." -ForegroundColor Green
Write-Host ""

# 1. Exportar dados locais
Write-Host "1. Exportando dados locais..." -ForegroundColor Yellow
node exportar-dados-local.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao exportar dados locais!" -ForegroundColor Red
    exit 1
}
Write-Host "   OK: Dados exportados" -ForegroundColor Green
Write-Host ""

# 2. Verificar se jobPositions.json existe
if (-not (Test-Path "dados_exportados\jobPositions.json")) {
    Write-Host "ERRO: Arquivo jobPositions.json nao encontrado!" -ForegroundColor Red
    exit 1
}

# 3. Criar diretório na VPS se não existir
Write-Host "2. Criando diretorio na VPS..." -ForegroundColor Yellow
$createDirScript = "mkdir -p $VPS_PATH/dados_exportados"
if (Get-Command sshpass -ErrorAction SilentlyContinue) {
    $env:SSHPASS = $VPS_PASS
    sshpass -e ssh "${VPS_USER}@${VPS_IP}" $createDirScript
} else {
    ssh "${VPS_USER}@${VPS_IP}" $createDirScript
}
Write-Host "   OK: Diretorio criado" -ForegroundColor Green
Write-Host ""

# 4. Enviar arquivo para VPS
Write-Host "3. Enviando arquivo para VPS..." -ForegroundColor Yellow
if (Get-Command sshpass -ErrorAction SilentlyContinue) {
    $env:SSHPASS = $VPS_PASS
    sshpass -e scp "dados_exportados\jobPositions.json" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/dados_exportados/"
} else {
    scp "dados_exportados\jobPositions.json" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/dados_exportados/"
}
Write-Host "   OK: Arquivo enviado" -ForegroundColor Green
Write-Host ""

# 5. Importar na VPS
Write-Host "4. Importando dados na VPS..." -ForegroundColor Yellow
$importScript = @"
cd $VPS_PATH
node importar-dados-vps.js
"@

if (Get-Command sshpass -ErrorAction SilentlyContinue) {
    $env:SSHPASS = $VPS_PASS
    sshpass -e ssh "${VPS_USER}@${VPS_IP}" $importScript
} else {
    ssh "${VPS_USER}@${VPS_IP}" $importScript
}
Write-Host "   OK: Dados importados" -ForegroundColor Green
Write-Host ""

Write-Host "Sincronizacao concluida com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifique no site: https://central-rnc.com.br/admin/job-positions" -ForegroundColor Cyan
Write-Host ""


