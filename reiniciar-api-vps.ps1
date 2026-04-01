# Script para reiniciar a API na VPS
# Execute: .\reiniciar-api-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reiniciando API na VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar ferramentas
$hasSshpass = Get-Command sshpass -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue
$hasSsh = Get-Command ssh -ErrorAction SilentlyContinue

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

$restartScript = @'
cd /root/app

echo "1. Carregando ambiente Node.js..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   Node.js: $NODE_VERSION"
else
    if [ -d "$HOME/.nvm" ]; then
        source "$HOME/.nvm/nvm.sh"
        nvm use default 2>/dev/null || nvm use node 2>/dev/null || true
    fi
fi

echo ""
echo "2. Reiniciando aplicacao PM2..."
if command -v pm2 &> /dev/null; then
    pm2 restart central-rnc --update-env
    pm2 save
    echo "   OK: Aplicacao reiniciada"
    
    echo ""
    echo "3. Verificando status..."
    sleep 2
    pm2 status central-rnc
    
    echo ""
    echo "4. Verificando logs recentes..."
    pm2 logs central-rnc --lines 10 --nostream | tail -5
else
    echo "   ERRO: PM2 nao encontrado!"
    exit 1
fi

echo ""
echo "5. Testando endpoint novamente..."
sleep 3
curl -s http://localhost:3006/api/configurations | grep -o '"hcaptcha_site_key":"[^"]*"' || echo "   AVISO: Campo nao encontrado na resposta"

echo ""
echo "========================================"
echo "Reinicio concluido!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$restartScriptUnix = $restartScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $restartScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Reiniciando API..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/restart-api.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/restart-api.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/restart-api.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/restart-api.sh && bash /tmp/restart-api.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "API Reiniciada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Agora teste o captcha em:" -ForegroundColor Cyan
Write-Host "  https://central-rnc.com.br/contato" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANTE: Limpe o cache do navegador completamente!" -ForegroundColor Yellow
Write-Host "  - Pressione Ctrl+Shift+Delete" -ForegroundColor Gray
Write-Host "  - Selecione 'Tudo' ou 'Desde sempre'" -ForegroundColor Gray
Write-Host "  - Ou use uma janela anonima/privada" -ForegroundColor Gray
Write-Host ""


