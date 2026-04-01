# Script para atualizar SITE KEY do hCaptcha no banco de dados
# Execute: .\atualizar-sitekey-hcaptcha-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$SITE_KEY = "7752cf8c-cc60-4c64-9210-8020448030a4"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Atualizando SITE KEY do hCaptcha" -ForegroundColor Yellow
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

$updateScript = @'
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
echo "2. Atualizando hcaptcha_site_key no banco de dados..."

# Criar script Node.js no diretório do projeto (ES module)
cat > update-hcaptcha-sitekey.mjs << 'NODE_SCRIPT'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateSiteKey() {
  try {
    const siteKey = '7752cf8c-cc60-4c64-9210-8020448030a4';
    
    console.log('Buscando configuração...');
    let config = await prisma.configuration.findFirst();
    
    if (!config) {
      console.log('Criando nova configuração...');
      config = await prisma.configuration.create({
        data: {
          id: 'default',
          company_name: 'Central Contábil',
          hcaptcha_site_key: siteKey,
        },
      });
      console.log('✅ Configuração criada com hcaptcha_site_key');
    } else {
      console.log('Atualizando configuração existente...');
      config = await prisma.configuration.update({
        where: { id: config.id },
        data: {
          hcaptcha_site_key: siteKey,
        },
      });
      console.log('✅ hcaptcha_site_key atualizada com sucesso');
    }
    
    console.log('Site Key configurada:', config.hcaptcha_site_key);
  } catch (error) {
    console.error('❌ Erro ao atualizar:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateSiteKey();
NODE_SCRIPT

node update-hcaptcha-sitekey.mjs

echo ""
echo "3. Verificando se foi atualizado..."
node --input-type=module -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.configuration.findFirst().then(config => {
  if (config && config.hcaptcha_site_key) {
    console.log('   OK: hcaptcha_site_key encontrada:', config.hcaptcha_site_key);
  } else {
    console.log('   AVISO: hcaptcha_site_key não encontrada');
  }
  prisma.\$disconnect();
});
"

echo ""
echo "4. Limpando arquivo temporário..."
rm -f update-hcaptcha-sitekey.mjs

echo ""
echo "========================================"
echo "Atualização concluida!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$updateScriptUnix = $updateScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $updateScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Atualizando SITE KEY..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/update-sitekey.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/update-sitekey.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/update-sitekey.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/update-sitekey.sh && bash /tmp/update-sitekey.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SITE KEY Atualizada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "RESUMO:" -ForegroundColor Yellow
Write-Host "- SECRET KEY: Configurada no .env do backend" -ForegroundColor Gray
Write-Host "- SITE KEY: Atualizada no banco de dados" -ForegroundColor Gray
Write-Host ""
Write-Host "O captcha deve funcionar agora!" -ForegroundColor Cyan
Write-Host "Teste acessando: https://central-rnc.com.br/contato" -ForegroundColor Gray
Write-Host "IMPORTANTE: Limpe o cache do navegador (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host ""

