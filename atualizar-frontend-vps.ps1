# Script para atualizar apenas o frontend na VPS
# Execute: .\atualizar-frontend-vps.ps1

$ErrorActionPreference = "Stop"

# Configurações da VPS
$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"
$DOMAIN = "central-rnc.com.br"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Atualizando Frontend na VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Verificar ferramentas disponíveis
$hasSshpass = Get-Command sshpass -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue
$hasSsh = Get-Command ssh -ErrorAction SilentlyContinue
$hasScp = Get-Command scp -ErrorAction SilentlyContinue

if (-not $hasSsh -or -not $hasScp) {
    Write-Host "ERRO: SSH ou SCP nao encontrados!" -ForegroundColor Red
    exit 1
}

# Função para enviar arquivo/pasta via SCP
function Send-ToVPS {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" -r `"$LocalPath`" ${VPS_USER}@${VPS_IP}:${RemotePath}"
        cmd /c $pscpCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    }
}

# Função para executar comandos SSH
function Invoke-SSHCommand {
    param(
        [string]$Command
    )
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e ssh "${VPS_USER}@${VPS_IP}" $Command
    } elseif ($hasPlink) {
        $plinkCommand = "plink -ssh -pw `"$VPS_PASS`" -batch ${VPS_USER}@${VPS_IP} `"$Command`""
        cmd /c $plinkCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & ssh "${VPS_USER}@${VPS_IP}" $Command
    }
}

# ========================================
# ETAPA 1: Build do Frontend
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 1: Build do Frontend" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fazendo build do frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no build do frontend!" -ForegroundColor Red
    exit 1
}
Write-Host "Build concluido" -ForegroundColor Green
Write-Host ""

# ========================================
# ETAPA 2: Enviar Frontend para VPS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 2: Enviar Frontend para VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Enviando arquivos do frontend..." -ForegroundColor Cyan
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "   Enviando: dist" -ForegroundColor Gray
    Send-ToVPS -LocalPath "dist" -RemotePath "$VPS_PATH/"
    Write-Host "   OK: dist enviado" -ForegroundColor Green
} catch {
    Write-Host "   ERRO ao enviar dist: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Arquivos enviados com sucesso!" -ForegroundColor Green
Write-Host ""

# ========================================
# ETAPA 3: Atualizar Frontend na VPS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 3: Atualizar Frontend na VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Executando comandos na VPS..." -ForegroundColor Cyan
Write-Host ""

$remoteScript = @'
cd /root/app

echo "1. Copiando arquivos estaticos para Nginx..."
sudo rm -rf /var/www/central-rnc/*
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

echo ""
echo "2. Verificando pasta uploads..."
if [ -d "public/uploads" ]; then
    sudo mkdir -p /var/www/central-rnc/uploads
    if [ "$(ls -A public/uploads 2>/dev/null)" ]; then
        sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    fi
    sudo chown -R www-data:www-data /var/www/central-rnc/uploads
    sudo chmod -R 755 /var/www/central-rnc/uploads
fi

echo ""
echo "3. Limpando cache do Nginx..."
sudo systemctl reload nginx

echo ""
echo "Frontend atualizado com sucesso!"
'@

# Criar arquivo temporário
$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
[System.IO.File]::WriteAllText($tempScriptFile, $remoteScript, [System.Text.Encoding]::UTF8)

try {
    # Enviar script para VPS
    Write-Host "   Enviando script de atualizacao..." -ForegroundColor Gray
    Send-ToVPS -LocalPath $tempScriptFile -RemotePath "$VPS_PATH/atualizar-frontend.sh"
    
    # Executar script na VPS
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e ssh "${VPS_USER}@${VPS_IP}" "chmod +x $VPS_PATH/atualizar-frontend.sh && bash $VPS_PATH/atualizar-frontend.sh"
    } elseif ($hasPlink) {
        $plinkCommand = "plink -ssh -pw `"$VPS_PASS`" -batch ${VPS_USER}@${VPS_IP} `"chmod +x $VPS_PATH/atualizar-frontend.sh && bash $VPS_PATH/atualizar-frontend.sh`""
        cmd /c $plinkCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & ssh "${VPS_USER}@${VPS_IP}" "chmod +x $VPS_PATH/atualizar-frontend.sh && bash $VPS_PATH/atualizar-frontend.sh"
    }
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Frontend atualizado com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: https://$DOMAIN/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "DICA: Se ainda nao aparecer, limpe o cache do navegador (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host ""


