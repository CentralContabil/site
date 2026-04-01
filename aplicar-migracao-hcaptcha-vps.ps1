# Script para aplicar migração do hCaptcha na VPS
# Execute: .\aplicar-migracao-hcaptcha-vps.ps1

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

echo "1. Atualizando schema do Prisma..."
# Copiar schema atualizado (assumindo que já foi enviado)
if [ -f "prisma/schema.prisma" ]; then
    echo "   Schema encontrado"
else
    echo "   AVISO: Schema nao encontrado. Envie o schema atualizado primeiro."
    exit 1
fi

echo ""
echo "2. Aplicando migracao do banco de dados..."
npx prisma db push --accept-data-loss || npx prisma migrate deploy

echo ""
echo "3. Regenerando Prisma Client..."
npx prisma generate

echo ""
echo "4. Verificando se o campo foi adicionado..."
if command -v psql &> /dev/null; then
    echo "   Verificando campo hcaptcha_site_key na tabela configurations..."
    psql $DATABASE_URL -c "\d configurations" 2>/dev/null | grep -i "hcaptcha" || echo "   Campo ainda nao existe (pode ser necessario aplicar migracao manual)"
else
    echo "   AVISO: psql nao encontrado, nao foi possivel verificar"
fi

echo ""
echo "5. Reiniciando aplicacao PM2..."
export PATH="/usr/bin:/bin:/usr/local/bin:$HOME/.local/bin:$HOME/.nvm/versions/node/*/bin"
if command -v pm2 &> /dev/null; then
    pm2 restart central-rnc || pm2 start ecosystem.config.cjs --name central-rnc
    pm2 save
    echo "   OK: Aplicacao reiniciada"
else
    echo "   AVISO: PM2 nao encontrado no PATH"
    echo "   Tentando com caminho completo..."
    if [ -f "/root/.nvm/versions/node/*/bin/pm2" ]; then
        /root/.nvm/versions/node/*/bin/pm2 restart central-rnc
    else
        echo "   ERRO: PM2 nao encontrado. Reinicie manualmente."
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
Write-Host "PROXIMO PASSO:" -ForegroundColor Yellow
Write-Host "Obtenha a SITE KEY do dashboard hCaptcha e execute:" -ForegroundColor Gray
Write-Host "  .\atualizar-sitekey-hcaptcha.ps1" -ForegroundColor Cyan
Write-Host ""


