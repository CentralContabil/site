# Script para verificar se o endpoint está retornando hcaptcha_site_key
# Execute: .\verificar-endpoint-config-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificando Endpoint de Configuracao" -ForegroundColor Yellow
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

$checkScript = @'
echo "1. Testando endpoint /api/configurations..."
RESPONSE=$(curl -s http://localhost:3006/api/configurations)
echo "$RESPONSE" | head -c 1000
echo ""
echo ""

echo "2. Verificando se hcaptcha_site_key esta na resposta..."
if echo "$RESPONSE" | grep -q "hcaptcha_site_key"; then
    echo "   OK: hcaptcha_site_key encontrada na resposta"
    echo ""
    echo "   Valor do campo:"
    echo "$RESPONSE" | grep -o '"hcaptcha_site_key":"[^"]*"' | head -1
else
    echo "   ERRO: hcaptcha_site_key NAO encontrada na resposta!"
    echo ""
    echo "   Campos presentes na resposta:"
    echo "$RESPONSE" | grep -o '"[^"]*":' | head -20
fi

echo ""
echo "3. Verificando Prisma Client..."
cd /root/app
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if [ -f "node_modules/@prisma/client/index.d.ts" ]; then
    if grep -q "hcaptcha_site_key" "node_modules/@prisma/client/index.d.ts"; then
        echo "   OK: Prisma Client contem hcaptcha_site_key"
    else
        echo "   ERRO: Prisma Client NAO contem hcaptcha_site_key!"
        echo "   Regenerando Prisma Client..."
        npx prisma generate
    fi
else
    echo "   AVISO: Prisma Client nao encontrado"
fi

echo ""
echo "========================================"
echo "Verificacao concluida!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$checkScriptUnix = $checkScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $checkScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Verificando endpoint..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-endpoint.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/check-endpoint.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-endpoint.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/check-endpoint.sh && bash /tmp/check-endpoint.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Verificacao Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


