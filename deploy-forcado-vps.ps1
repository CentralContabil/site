# Script para FORÇAR deploy completo - Remove tudo e recria
# Execute: .\deploy-forcado-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy FORCADO para VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar ferramentas
$hasSshpass = Get-Command sshpass -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue
$hasSsh = Get-Command ssh -ErrorAction SilentlyContinue

if (-not $hasSsh) {
    Write-Host "ERRO: SSH nao encontrado!" -ForegroundColor Red
    exit 1
}

function Invoke-SSHCommand {
    param([string]$Command)
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e ssh "${VPS_USER}@${VPS_IP}" $Command
    } elseif ($hasPlink) {
        $plinkCommand = "plink -ssh -pw `"$VPS_PASS`" -batch ${VPS_USER}@${VPS_IP} `"$Command`""
        cmd /c $plinkCommand
    } else {
        & ssh "${VPS_USER}@${VPS_IP}" $Command
    }
}

function Send-ToVPS {
    param([string]$LocalPath, [string]$RemotePath)
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" -r `"$LocalPath`" ${VPS_USER}@${VPS_IP}:${RemotePath}"
        cmd /c $pscpCommand
    } else {
        & scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    }
}

# ETAPA 1: Build
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 1: Build do Frontend" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fazendo build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build falhou!" -ForegroundColor Red
    exit 1
}
Write-Host "Build concluido" -ForegroundColor Green
Write-Host ""

# ETAPA 2: Remover dist antigo na VPS
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 2: Remover dist antigo na VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Removendo dist antigo..." -ForegroundColor Cyan
Invoke-SSHCommand -Command "cd $VPS_PATH && rm -rf dist && echo 'Dist removido'"
Write-Host ""

# ETAPA 3: Enviar novo dist
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 3: Enviar novo dist" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Enviando dist..." -ForegroundColor Cyan
Send-ToVPS -LocalPath "dist" -RemotePath "$VPS_PATH/"
Write-Host "Dist enviado" -ForegroundColor Green
Write-Host ""

# ETAPA 4: Atualizar Nginx
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 4: Atualizar Nginx" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$updateScript = @'
cd /root/app

echo "1. Verificando arquivo JS em dist..."
JS_FILE=$(find dist/assets -name "index-*.js" | head -1)
if [ -n "$JS_FILE" ]; then
    JS_NAME=$(basename "$JS_FILE")
    JS_SIZE=$(du -h "$JS_FILE" | cut -f1)
    echo "   Arquivo: $JS_NAME"
    echo "   Tamanho: $JS_SIZE"
    if grep -q "LandingPagesAdmin\|FormsAdmin" "$JS_FILE" 2>/dev/null; then
        echo "   OK: Contem LandingPagesAdmin e FormsAdmin"
    else
        echo "   ERRO: NAO contem LandingPagesAdmin/FormsAdmin!"
    fi
else
    echo "   ERRO: Arquivo JS nao encontrado!"
    exit 1
fi

echo ""
echo "2. Removendo TUDO do Nginx..."
sudo rm -rf /var/www/central-rnc/*

echo ""
echo "3. Copiando novo frontend..."
sudo cp -r dist/* /var/www/central-rnc/

echo ""
echo "4. Verificando arquivo JS no Nginx..."
NGINX_JS_FILE=$(find /var/www/central-rnc/assets -name "index-*.js" | head -1)
if [ -n "$NGINX_JS_FILE" ]; then
    NGINX_JS_NAME=$(basename "$NGINX_JS_FILE")
    echo "   Arquivo: $NGINX_JS_NAME"
    if grep -q "LandingPagesAdmin\|FormsAdmin" "$NGINX_JS_FILE" 2>/dev/null; then
        echo "   OK: Arquivo JS no Nginx contem LandingPagesAdmin e FormsAdmin"
    else
        echo "   ERRO: Arquivo JS no Nginx NAO contem LandingPagesAdmin/FormsAdmin!"
    fi
fi

echo ""
echo "5. Ajustando permissoes..."
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

echo ""
echo "6. Reiniciando Nginx..."
sudo systemctl reload nginx

echo ""
echo "========================================"
echo "Atualizacao concluida!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$updateScriptUnix = $updateScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $updateScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/update.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/update.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/update.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x $VPS_PATH/update.sh && bash $VPS_PATH/update.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deploy FORCADO Concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: https://central-rnc.com.br/admin" -ForegroundColor Cyan
Write-Host "IMPORTANTE: Limpe o cache do navegador!" -ForegroundColor Yellow
Write-Host ""


