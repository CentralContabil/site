# Script para reiniciar Nginx e verificar
# Execute: .\reiniciar-nginx-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reiniciando Nginx" -ForegroundColor Yellow
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
echo "1. Testando configuracao do Nginx..."
if sudo nginx -t; then
    echo "   OK: Configuracao valida"
else
    echo "   ERRO: Configuracao invalida!"
    exit 1
fi

echo ""
echo "2. Reiniciando Nginx..."
sudo systemctl restart nginx
sleep 2

echo ""
echo "3. Verificando status do Nginx..."
if sudo systemctl is-active --quiet nginx; then
    echo "   OK: Nginx esta rodando"
else
    echo "   ERRO: Nginx nao esta rodando!"
    sudo systemctl status nginx --no-pager | head -10
    exit 1
fi

echo ""
echo "4. Testando acesso a um arquivo de upload..."
TEST_FILE=$(find /var/www/central-rnc/uploads -type f | head -1)
if [ -n "$TEST_FILE" ]; then
    FILE_NAME=$(basename "$TEST_FILE")
    echo "   Testando: $FILE_NAME"
    
    # Testar via curl
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/uploads/$FILE_NAME" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   OK: Arquivo acessivel via HTTP (200)"
    else
        echo "   AVISO: HTTP code: $HTTP_CODE"
        echo "   Verificando permissoes..."
        ls -la "$TEST_FILE"
    fi
fi

echo ""
echo "5. Verificando logs do Nginx para erros recentes..."
sudo tail -20 /var/log/nginx/error.log | grep -i "uploads\|404" | tail -5 || echo "   Nenhum erro relacionado encontrado"

echo ""
echo "========================================"
echo "Reinicio concluido!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$restartScriptUnix = $restartScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $restartScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Reiniciando Nginx..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/restart-nginx.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/restart-nginx.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/restart-nginx.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/restart-nginx.sh && bash /tmp/restart-nginx.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Nginx Reiniciado!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: Limpe o cache do navegador!" -ForegroundColor Yellow
Write-Host "   - Pressione Ctrl+Shift+Delete" -ForegroundColor Gray
Write-Host "   - Ou use Ctrl+F5 para forcar recarregamento" -ForegroundColor Gray
Write-Host "   - Ou abra em uma janela anonima/privada" -ForegroundColor Gray
Write-Host ""


