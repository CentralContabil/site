# Script para sincronizar pasta uploads com VPS
# Execute: .\sincronizar-uploads-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sincronizando Uploads com VPS" -ForegroundColor Yellow
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

# Verificar se pasta uploads existe localmente
if (-not (Test-Path "public/uploads")) {
    Write-Host "AVISO: Pasta public/uploads nao existe localmente!" -ForegroundColor Yellow
    Write-Host "Criando pasta..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path "public/uploads" -Force | Out-Null
}

# Contar arquivos locais
$localFiles = Get-ChildItem -Path "public/uploads" -File -Recurse
$fileCount = $localFiles.Count
Write-Host "Arquivos encontrados localmente: $fileCount" -ForegroundColor Cyan
Write-Host ""

if ($fileCount -eq 0) {
    Write-Host "AVISO: Nenhum arquivo encontrado em public/uploads" -ForegroundColor Yellow
    Write-Host "Continuando mesmo assim..." -ForegroundColor Gray
}

# ETAPA 1: Enviar uploads para VPS
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 1: Enviar uploads para VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Enviando pasta public/uploads..." -ForegroundColor Cyan
Write-Host ""

try {
    Send-ToVPS -LocalPath "public/uploads" -RemotePath "$VPS_PATH/public/"
    Write-Host "Uploads enviados" -ForegroundColor Green
} catch {
    Write-Host "ERRO ao enviar uploads: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ETAPA 2: Copiar uploads para Nginx e ajustar permissões
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 2: Configurar uploads no Nginx" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$setupScript = @'
cd /root/app

echo "1. Verificando pasta uploads em public..."
if [ -d "public/uploads" ]; then
    FILE_COUNT=$(find public/uploads -type f | wc -l)
    echo "   Arquivos encontrados: $FILE_COUNT"
else
    echo "   ERRO: Pasta public/uploads nao existe!"
    exit 1
fi

echo ""
echo "2. Criando pasta uploads no Nginx..."
sudo mkdir -p /var/www/central-rnc/uploads

echo ""
echo "3. Copiando arquivos para Nginx..."
if [ "$(ls -A public/uploads 2>/dev/null)" ]; then
    sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    echo "   Arquivos copiados"
else
    echo "   AVISO: Pasta uploads vazia"
fi

echo ""
echo "4. Ajustando permissoes..."
sudo chown -R www-data:www-data /var/www/central-rnc/uploads
sudo chmod -R 755 /var/www/central-rnc/uploads

echo ""
echo "5. Verificando arquivos no Nginx..."
NGINX_FILE_COUNT=$(find /var/www/central-rnc/uploads -type f 2>/dev/null | wc -l)
echo "   Arquivos no Nginx: $NGINX_FILE_COUNT"

echo ""
echo "6. Listando alguns arquivos para verificar..."
ls -la /var/www/central-rnc/uploads/ | head -10

echo ""
echo "7. Testando acesso a um arquivo..."
if [ "$NGINX_FILE_COUNT" -gt 0 ]; then
    FIRST_FILE=$(find /var/www/central-rnc/uploads -type f | head -1)
    if [ -n "$FIRST_FILE" ]; then
        FILE_NAME=$(basename "$FIRST_FILE")
        echo "   Testando: $FILE_NAME"
        if [ -f "$FIRST_FILE" ]; then
            echo "   OK: Arquivo existe e e acessivel"
        else
            echo "   ERRO: Arquivo nao e acessivel"
        fi
    fi
fi

echo ""
echo "========================================"
echo "Configuracao de uploads concluida!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$setupScriptUnix = $setupScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $setupScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Executando configuracao..." -ForegroundColor Cyan
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/setup-uploads.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/setup-uploads.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/setup-uploads.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x $VPS_PATH/setup-uploads.sh && bash $VPS_PATH/setup-uploads.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Sincronizacao de Uploads Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: https://central-rnc.com.br" -ForegroundColor Cyan
Write-Host "IMPORTANTE: Limpe o cache do navegador!" -ForegroundColor Yellow
Write-Host ""


