# Script para comparar builds entre localhost e VPS
# Execute: .\comparar-builds.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comparando Builds: Localhost vs VPS" -ForegroundColor Yellow
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

Write-Host "1. Verificando build LOCAL..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "dist")) {
    Write-Host "   ERRO: Pasta dist nao existe! Execute 'npm run build' primeiro." -ForegroundColor Red
    exit 1
}

# Encontrar arquivo JS principal
$localJsFile = Get-ChildItem -Path "dist/assets" -Filter "index-*.js" | Select-Object -First 1
if ($localJsFile) {
    $localJsSize = $localJsFile.Length / 1MB
    $localJsName = $localJsFile.Name
    Write-Host "   Arquivo JS: $localJsName" -ForegroundColor Green
    Write-Host "   Tamanho: $([math]::Round($localJsSize, 2)) MB" -ForegroundColor Green
    
    # Verificar se contém LandingPages e FormsAdmin
    $jsContent = Get-Content $localJsFile.FullName -Raw
    if ($jsContent -match "LandingPagesAdmin|FormsAdmin") {
        Write-Host "   OK: Contem LandingPagesAdmin e FormsAdmin" -ForegroundColor Green
    } else {
        Write-Host "   ERRO: NAO contem LandingPagesAdmin ou FormsAdmin!" -ForegroundColor Red
    }
    
    # Calcular hash MD5
    $localHash = (Get-FileHash -Path $localJsFile.FullName -Algorithm MD5).Hash
    Write-Host "   Hash MD5: $localHash" -ForegroundColor Cyan
} else {
    Write-Host "   ERRO: Arquivo JS nao encontrado em dist/assets/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Verificando build na VPS..." -ForegroundColor Cyan
Write-Host ""

$remoteCheckScript = @'
cd /root/app

echo "Verificando build na VPS..."
if [ -d "dist/assets" ]; then
    VPS_JS_FILE=$(find dist/assets -name "index-*.js" | head -1)
    if [ -n "$VPS_JS_FILE" ]; then
        VPS_JS_NAME=$(basename "$VPS_JS_FILE")
        VPS_JS_SIZE=$(du -h "$VPS_JS_FILE" | cut -f1)
        echo "   Arquivo JS: $VPS_JS_NAME"
        echo "   Tamanho: $VPS_JS_SIZE"
        
        if grep -q "LandingPagesAdmin\|FormsAdmin" "$VPS_JS_FILE" 2>/dev/null; then
            echo "   OK: Contem LandingPagesAdmin e FormsAdmin"
        else
            echo "   ERRO: NAO contem LandingPagesAdmin ou FormsAdmin!"
        fi
        
        VPS_HASH=$(md5sum "$VPS_JS_FILE" | cut -d' ' -f1)
        echo "   Hash MD5: $VPS_HASH"
    else
        echo "   ERRO: Arquivo JS nao encontrado!"
    fi
else
    echo "   ERRO: Pasta dist/assets nao existe!"
fi

echo ""
echo "Verificando frontend no Nginx..."
if [ -d "/var/www/central-rnc/assets" ]; then
    NGINX_JS_FILE=$(find /var/www/central-rnc/assets -name "index-*.js" | head -1)
    if [ -n "$NGINX_JS_FILE" ]; then
        NGINX_JS_NAME=$(basename "$NGINX_JS_FILE")
        NGINX_JS_SIZE=$(du -h "$NGINX_JS_FILE" | cut -f1)
        echo "   Arquivo JS: $NGINX_JS_NAME"
        echo "   Tamanho: $NGINX_JS_SIZE"
        
        if grep -q "LandingPagesAdmin\|FormsAdmin" "$NGINX_JS_FILE" 2>/dev/null; then
            echo "   OK: Contem LandingPagesAdmin e FormsAdmin"
        else
            echo "   ERRO: NAO contem LandingPagesAdmin ou FormsAdmin!"
        fi
        
        NGINX_HASH=$(md5sum "$NGINX_JS_FILE" | cut -d' ' -f1)
        echo "   Hash MD5: $NGINX_HASH"
    else
        echo "   ERRO: Arquivo JS nao encontrado no Nginx!"
    fi
else
    echo "   ERRO: Pasta /var/www/central-rnc/assets nao existe!"
fi
'@

# Criar arquivo temporário
$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
# Converter CRLF para LF (Unix line endings)
$remoteCheckScriptUnix = $remoteCheckScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $remoteCheckScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    # Enviar script para VPS
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/comparar-builds.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/comparar-builds.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/comparar-builds.sh"
    }
    
    # Executar script na VPS
    Invoke-SSHCommand -Command "chmod +x $VPS_PATH/comparar-builds.sh && bash $VPS_PATH/comparar-builds.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comparacao concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se os hashes forem diferentes, execute: .\deploy-limpo-vps.ps1" -ForegroundColor Yellow
Write-Host ""

