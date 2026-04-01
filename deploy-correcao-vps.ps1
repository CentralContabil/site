# Script para enviar correção rápida para VPS
# Execute: .\deploy-correcao-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy de Correcao para VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar ferramentas disponíveis
$hasSshpass = Get-Command sshpass -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue
$hasSsh = Get-Command ssh -ErrorAction SilentlyContinue

if (-not $hasSsh) {
    Write-Host "ERRO: SSH nao encontrado!" -ForegroundColor Red
    exit 1
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

# Função para enviar arquivos
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
        & scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    }
}

# ========================================
# ETAPA 1: Build do Frontend
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 1: Build do Frontend" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fazendo build do frontend..." -ForegroundColor Cyan
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no build do frontend!" -ForegroundColor Red
    exit 1
}

Write-Host "Build concluido" -ForegroundColor Green
Write-Host ""

# Verificar se dist/ foi criado
if (-not (Test-Path "dist")) {
    Write-Host "ERRO: Pasta 'dist' nao foi criada!" -ForegroundColor Red
    exit 1
}

# ========================================
# ETAPA 2: Enviar Frontend para VPS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 2: Enviar Frontend para VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Enviando pasta dist para a VPS..." -ForegroundColor Cyan
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

# ========================================
# ETAPA 3: Atualizar Frontend na VPS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 3: Atualizar Frontend na VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Executando comandos na VPS..." -ForegroundColor Cyan
Write-Host ""

$updateScript = @'
cd /root/app

echo "1. Verificando arquivo JS em dist..."
JS_FILE=$(find dist/assets -name "index-*.js" | head -1)
if [ -n "$JS_FILE" ]; then
    JS_NAME=$(basename "$JS_FILE")
    echo "   Arquivo: $JS_NAME"
    if grep -q "LandingPagesAdmin\|FormsAdmin" "$JS_FILE" 2>/dev/null; then
        echo "   OK: Contem LandingPagesAdmin e FormsAdmin"
    fi
fi

echo ""
echo "2. Removendo frontend antigo..."
sudo rm -rf /var/www/central-rnc/*

echo ""
echo "3. Copiando novo frontend..."
sudo cp -r dist/* /var/www/central-rnc/
echo "   Copiado"

echo ""
echo "4. Verificando arquivo JS no Nginx..."
NGINX_JS_FILE=$(find /var/www/central-rnc/assets -name "index-*.js" | head -1)
if [ -n "$NGINX_JS_FILE" ]; then
    NGINX_JS_NAME=$(basename "$NGINX_JS_FILE")
    echo "   Arquivo: $NGINX_JS_NAME"
    if grep -q "LandingPagesAdmin\|FormsAdmin" "$NGINX_JS_FILE" 2>/dev/null; then
        echo "   OK: Arquivo JS no Nginx contem LandingPagesAdmin e FormsAdmin"
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
echo "Frontend atualizado com sucesso!"
echo "========================================"
'@

# Criar arquivo temporário
$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$updateScriptUnix = $updateScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $updateScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    # Enviar script para VPS
    Write-Host "   Enviando script de atualizacao..." -ForegroundColor Gray
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/update-frontend.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/update-frontend.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/update-frontend.sh"
    }
    
    # Executar script na VPS
    Invoke-SSHCommand -Command "chmod +x $VPS_PATH/update-frontend.sh && bash $VPS_PATH/update-frontend.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deploy de Correcao Concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: https://central-rnc.com.br/admin" -ForegroundColor Cyan
Write-Host "IMPORTANTE: Limpe o cache do navegador (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host ""

