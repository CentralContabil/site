# Script para configurar hCaptcha na VPS
# Execute: .\configurar-hcaptcha-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$HCAPTCHA_SECRET_KEY = "SUA_HCAPTCHA_SECRET_KEY_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configurando hCaptcha na VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Voce precisa fornecer a SITE KEY (chave publica) do hCaptcha!" -ForegroundColor Yellow
Write-Host "A chave fornecida e a SECRET KEY (usada apenas no backend)" -ForegroundColor Gray
Write-Host ""
Write-Host "Para obter a SITE KEY:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://dashboard.hcaptcha.com/" -ForegroundColor Gray
Write-Host "2. Selecione seu site" -ForegroundColor Gray
Write-Host "3. Copie a 'Site Key' (chave publica)" -ForegroundColor Gray
Write-Host ""
$SITE_KEY = Read-Host "Digite a SITE KEY do hCaptcha (ou pressione Enter para pular e configurar apenas a SECRET KEY)"

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

$configScript = @'
cd /root/app

echo "1. Configurando HCAPTCHA_SECRET_KEY no .env..."
if [ -f ".env" ]; then
    # Remover linha antiga se existir
    sed -i '/^HCAPTCHA_SECRET_KEY=/d' .env
    
    # Adicionar nova linha
    echo "HCAPTCHA_SECRET_KEY=\$HCAPTCHA_SECRET_KEY" >> .env
    echo "   OK: HCAPTCHA_SECRET_KEY configurada no .env"
else
    echo "   Criando arquivo .env..."
    echo "HCAPTCHA_SECRET_KEY=\$HCAPTCHA_SECRET_KEY" > .env
    echo "   OK: Arquivo .env criado com HCAPTCHA_SECRET_KEY"
fi

echo ""
echo "2. Verificando se a variavel foi adicionada..."
if grep -q "HCAPTCHA_SECRET_KEY" .env; then
    echo "   OK: Variavel encontrada no .env"
    grep "HCAPTCHA_SECRET_KEY" .env | sed 's/=.*/=***/'
else
    echo "   ERRO: Variavel nao encontrada!"
fi

echo ""
echo "3. Reiniciando aplicacao PM2 para carregar nova variavel..."
pm2 restart central-rnc || pm2 start ecosystem.config.cjs --name central-rnc
pm2 save

echo ""
echo "4. Verificando se a aplicacao esta rodando..."
pm2 status central-rnc

echo ""
echo "========================================"
echo "Configuracao concluida!"
echo "========================================"
echo ""
echo "IMPORTANTE:" 
echo "- A SECRET KEY foi configurada no backend"
echo "- Para o frontend funcionar, voce precisa:" 
echo "  1. Obter a SITE KEY do dashboard hCaptcha"
echo "  2. Adicionar no banco de dados (tabela configurations, campo hcaptcha_site_key)"
echo "  3. Ou configurar a variavel VITE_HCAPTCHA_SITE_KEY no build"
echo ""
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$configScriptUnix = $configScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $configScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Configurando hCaptcha..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/config-hcaptcha.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/config-hcaptcha.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/config-hcaptcha.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/config-hcaptcha.sh && bash /tmp/config-hcaptcha.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

if ($SITE_KEY) {
    Write-Host ""
    Write-Host "Configurando SITE KEY no banco de dados..." -ForegroundColor Cyan
    
    $dbScript = @'
cd /root/app

echo "Atualizando hcaptcha_site_key no banco de dados..."
echo "IMPORTANTE: Voce precisa adicionar o campo hcaptcha_site_key ao schema do Prisma primeiro!"
echo ""
echo "Para adicionar o campo, execute no localhost:"
echo "1. Adicione 'hcaptcha_site_key String?' ao model Configuration no schema.prisma"
echo "2. Execute: npx prisma db push"
echo "3. Depois atualize o registro no banco com a SITE KEY"
'@
    
    $tempDbScript = [System.IO.Path]::GetTempFileName() + ".sh"
    $dbScriptUnix = $dbScript -replace "`r`n", "`n" -replace "`r", "`n"
    [System.IO.File]::WriteAllText($tempDbScript, $dbScriptUnix, [System.Text.UTF8Encoding]::new($false))
    
    try {
        if ($hasSshpass) {
            $env:SSHPASS = $VPS_PASS
            sshpass -e scp "$tempDbScript" "${VPS_USER}@${VPS_IP}:/tmp/config-sitekey.sh"
        } elseif ($hasPlink) {
            $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempDbScript`" ${VPS_USER}@${VPS_IP}:/tmp/config-sitekey.sh"
            cmd /c $pscpCommand
        } else {
            & scp "$tempDbScript" "${VPS_USER}@${VPS_IP}:/tmp/config-sitekey.sh"
        }
        
        Invoke-SSHCommand -Command "chmod +x /tmp/config-sitekey.sh && bash /tmp/config-sitekey.sh"
    } finally {
        Remove-Item $tempDbScript -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Configuracao Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Obtenha a SITE KEY do dashboard hCaptcha" -ForegroundColor Gray
Write-Host "2. Adicione o campo hcaptcha_site_key ao schema do Prisma" -ForegroundColor Gray
Write-Host "3. Atualize o banco de dados com a SITE KEY" -ForegroundColor Gray
Write-Host ""


