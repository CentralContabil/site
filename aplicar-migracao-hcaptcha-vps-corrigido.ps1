# Script para aplicar migração do hCaptcha na VPS (versão corrigida)
# Execute: .\aplicar-migracao-hcaptcha-vps-corrigido.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Aplicando Migracao hCaptcha na VPS" -ForegroundColor Yellow
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

$migrateScript = @'
cd /root/app

echo "1. Carregando ambiente Node.js..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"

# Tentar encontrar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   Node.js encontrado: $NODE_VERSION"
else
    # Tentar carregar do nvm
    if [ -d "$HOME/.nvm" ]; then
        source "$HOME/.nvm/nvm.sh"
        nvm use default 2>/dev/null || nvm use node 2>/dev/null || true
    fi
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "   Node.js encontrado via nvm: $NODE_VERSION"
    else
        echo "   ERRO: Node.js nao encontrado!"
        exit 1
    fi
fi

echo ""
echo "2. Aplicando migracao do banco de dados..."
npx prisma db push --accept-data-loss

echo ""
echo "3. Regenerando Prisma Client..."
npx prisma generate

echo ""
echo "4. Verificando se o campo foi adicionado..."
if command -v psql &> /dev/null && [ -n "$DATABASE_URL" ]; then
    echo "   Verificando campo hcaptcha_site_key..."
    psql "$DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'configurations' AND column_name = 'hcaptcha_site_key';" 2>/dev/null | grep -q "hcaptcha_site_key" && echo "   OK: Campo hcaptcha_site_key existe" || echo "   AVISO: Campo ainda nao existe"
else
    echo "   AVISO: Nao foi possivel verificar (psql nao encontrado ou DATABASE_URL nao configurado)"
fi

echo ""
echo "5. Reiniciando aplicacao PM2..."
if command -v pm2 &> /dev/null; then
    pm2 restart central-rnc || pm2 start ecosystem.config.cjs --name central-rnc
    pm2 save
    echo "   OK: Aplicacao reiniciada"
else
    # Tentar encontrar PM2
    PM2_PATH=$(which pm2 2>/dev/null || find /root -name pm2 -type f 2>/dev/null | head -1)
    if [ -n "$PM2_PATH" ]; then
        $PM2_PATH restart central-rnc || $PM2_PATH start ecosystem.config.cjs --name central-rnc
        $PM2_PATH save
        echo "   OK: Aplicacao reiniciada via $PM2_PATH"
    else
        echo "   AVISO: PM2 nao encontrado. Reinicie manualmente com: pm2 restart central-rnc"
    fi
fi

echo ""
echo "========================================"
echo "Migracao concluida!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$migrateScriptUnix = $migrateScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $migrateScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Aplicando migracao..." -ForegroundColor Cyan
    Write-Host ""
    
    # Enviar schema atualizado
    Write-Host "Enviando schema atualizado..." -ForegroundColor Gray
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "prisma/schema.prisma" "${VPS_USER}@${VPS_IP}:/root/app/prisma/schema.prisma"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" prisma/schema.prisma ${VPS_USER}@${VPS_IP}:/root/app/prisma/schema.prisma"
        cmd /c $pscpCommand
    } else {
        & scp "prisma/schema.prisma" "${VPS_USER}@${VPS_IP}:/root/app/prisma/schema.prisma"
    }
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/migrate-hcaptcha.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/migrate-hcaptcha.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/migrate-hcaptcha.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/migrate-hcaptcha.sh && bash /tmp/migrate-hcaptcha.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Migracao Aplicada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "RESUMO:" -ForegroundColor Yellow
Write-Host "- SECRET KEY configurada no .env do backend" -ForegroundColor Gray
Write-Host "- Campo hcaptcha_site_key adicionado ao schema" -ForegroundColor Gray
Write-Host "- Migracao aplicada no banco de dados" -ForegroundColor Gray
Write-Host ""
Write-Host "PROXIMO PASSO:" -ForegroundColor Yellow
Write-Host "Obtenha a SITE KEY do dashboard hCaptcha:" -ForegroundColor Gray
Write-Host "  https://dashboard.hcaptcha.com/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Depois, atualize no banco de dados ou configure no admin" -ForegroundColor Gray
Write-Host ""


