# Script para verificar se a configuração do captcha está sendo carregada
# Execute: .\verificar-config-captcha-vps.ps1

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
echo "2. Verificando hcaptcha_site_key no banco de dados..."
node --input-type=module -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.configuration.findFirst().then(config => {
  if (config) {
    console.log('   ID:', config.id);
    console.log('   Company Name:', config.company_name);
    if (config.hcaptcha_site_key) {
      console.log('   ✅ hcaptcha_site_key encontrada:', config.hcaptcha_site_key);
    } else {
      console.log('   ❌ hcaptcha_site_key NAO encontrada!');
    }
  } else {
    console.log('   ❌ Nenhuma configuração encontrada!');
  }
  prisma.\$disconnect();
});
"

echo ""
echo "3. Testando endpoint de configuração..."
curl -s http://localhost:3006/api/configurations | head -c 500
echo ""

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
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-config.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/check-config.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-config.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/check-config.sh && bash /tmp/check-config.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Verificacao Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


