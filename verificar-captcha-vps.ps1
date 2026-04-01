# Script para verificar configuração do captcha na VPS
# Execute: .\verificar-captcha-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificando Configuracao do Captcha" -ForegroundColor Yellow
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
echo "1. Verificando variaveis de ambiente na API..."
cd /root/app
if [ -f ".env" ]; then
    echo "   Arquivo .env encontrado"
    if grep -q "HCAPTCHA" .env; then
        echo "   Variaveis HCAPTCHA encontradas:"
        grep "HCAPTCHA" .env | sed 's/=.*/=***/' 
    else
        echo "   AVISO: Nenhuma variavel HCAPTCHA encontrada no .env"
    fi
else
    echo "   AVISO: Arquivo .env nao encontrado"
fi

echo ""
echo "2. Verificando se o script hCaptcha esta no index.html..."
if [ -f "/var/www/central-rnc/index.html" ]; then
    if grep -q "hcaptcha" /var/www/central-rnc/index.html; then
        echo "   OK: Script hCaptcha encontrado no index.html"
        grep "hcaptcha" /var/www/central-rnc/index.html
    else
        echo "   ERRO: Script hCaptcha NAO encontrado no index.html!"
    fi
else
    echo "   ERRO: index.html nao encontrado!"
fi

echo ""
echo "3. Verificando configuracao no banco de dados..."
cd /root/app
if command -v psql &> /dev/null; then
    echo "   Verificando se hcaptcha_site_key existe na tabela configurations..."
    psql $DATABASE_URL -c "SELECT id, company_name, hcaptcha_site_key FROM configurations LIMIT 1;" 2>/dev/null || echo "   AVISO: Nao foi possivel consultar o banco"
else
    echo "   AVISO: psql nao encontrado"
fi

echo ""
echo "4. Verificando logs do PM2 para erros relacionados ao captcha..."
pm2 logs central-rnc --lines 20 --nostream | grep -i "captcha\|hcaptcha" | tail -5 || echo "   Nenhum erro relacionado encontrado"

echo ""
echo "========================================"
echo "Verificacao concluida!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$checkScriptUnix = $checkScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $checkScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Verificando configuracao..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-captcha.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/check-captcha.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-captcha.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/check-captcha.sh && bash /tmp/check-captcha.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Verificacao Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


