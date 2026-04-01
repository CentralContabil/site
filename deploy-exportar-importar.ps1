# Script para Deploy das Funcionalidades de Exportar/Importar
# Execute: .\deploy-exportar-importar.ps1

$ErrorActionPreference = "Stop"

# Configurações da VPS
$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "Enviando alteracoes de exportar/importar para VPS..." -ForegroundColor Green
Write-Host ""

# Verificar se dist existe
if (-not (Test-Path "dist")) {
    Write-Host "ERRO: Pasta 'dist' nao encontrada. Execute 'npm run build' primeiro!" -ForegroundColor Red
    exit 1
}

# Enviar apenas dist (frontend build)
Write-Host "1. Enviando arquivos do frontend (dist)..." -ForegroundColor Yellow

# Usar plink (PuTTY) ou sshpass se disponível
$usePlink = Get-Command plink -ErrorAction SilentlyContinue
$useSshpass = Get-Command sshpass -ErrorAction SilentlyContinue

if ($usePlink) {
    # Usar plink (PuTTY)
    Write-Host "   Usando plink..." -ForegroundColor Gray
    $env:PLINK_PROTOCOL = "ssh"
    echo y | plink -ssh -pw $VPS_PASS ${VPS_USER}@${VPS_IP} "mkdir -p $VPS_PATH/dist"
    
    # Enviar arquivos
    $distFiles = Get-ChildItem -Path "dist" -Recurse -File
    foreach ($file in $distFiles) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\dist\", "").Replace("\", "/")
        $remotePath = "$VPS_PATH/dist/$relativePath"
        $remoteDir = Split-Path $remotePath -Parent
        
        echo y | plink -ssh -pw $VPS_PASS ${VPS_USER}@${VPS_IP} "mkdir -p $remoteDir"
        echo y | pscp -pw $VPS_PASS $file.FullName ${VPS_USER}@${VPS_IP}:$remotePath
    }
} elseif ($useSshpass) {
    # Usar sshpass
    Write-Host "   Usando sshpass..." -ForegroundColor Gray
    $env:SSHPASS = $VPS_PASS
    sshpass -e ssh "${VPS_USER}@${VPS_IP}" "mkdir -p $VPS_PATH/dist"
    sshpass -e scp -r dist/* "${VPS_USER}@${VPS_IP}:$VPS_PATH/dist/"
} else {
    # Usar scp padrão (vai pedir senha)
    Write-Host "   Usando scp (sera necessario digitar a senha)..." -ForegroundColor Yellow
    Write-Host "   Senha: $VPS_PASS" -ForegroundColor Cyan
    scp -r dist/* "${VPS_USER}@${VPS_IP}:$VPS_PATH/dist/"
}

Write-Host "   OK: Arquivos do frontend enviados" -ForegroundColor Green
Write-Host ""

# Copiar arquivos estáticos para Nginx
Write-Host "2. Copiando arquivos estaticos para Nginx..." -ForegroundColor Yellow
$copyScript = @"
cd $VPS_PATH
sudo rm -rf /var/www/central-rnc/*
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc
"@

if ($usePlink) {
    echo y | plink -ssh -pw $VPS_PASS ${VPS_USER}@${VPS_IP} $copyScript
} elseif ($useSshpass) {
    $env:SSHPASS = $VPS_PASS
    sshpass -e ssh "${VPS_USER}@${VPS_IP}" $copyScript
} else {
    ssh "${VPS_USER}@${VPS_IP}" $copyScript
}

Write-Host "   OK: Arquivos copiados para Nginx" -ForegroundColor Green
Write-Host ""

# Reiniciar Nginx
Write-Host "3. Reiniciando Nginx..." -ForegroundColor Yellow
$reloadNginx = "sudo systemctl reload nginx"

if ($usePlink) {
    echo y | plink -ssh -pw $VPS_PASS ${VPS_USER}@${VPS_IP} $reloadNginx
} elseif ($useSshpass) {
    $env:SSHPASS = $VPS_PASS
    sshpass -e ssh "${VPS_USER}@${VPS_IP}" $reloadNginx
} else {
    ssh "${VPS_USER}@${VPS_IP}" $reloadNginx
}

Write-Host "   OK: Nginx reiniciado" -ForegroundColor Green
Write-Host ""

Write-Host "Deploy concluido com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Teste no site: https://central-rnc.com.br/admin/job-positions" -ForegroundColor Cyan
Write-Host ""


