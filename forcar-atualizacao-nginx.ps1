# Script para FORÇAR atualização do Nginx
# Execute: .\forcar-atualizacao-nginx.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FORCANDO Atualizacao do Nginx" -ForegroundColor Yellow
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

$forceUpdateScript = @'
cd /root/app

echo "1. Removendo dist antigo..."
rm -rf dist

echo ""
echo "2. Verificando se dist foi removido..."
if [ -d "dist" ]; then
    echo "   AVISO: Pasta dist ainda existe, forçando remoção..."
    sudo rm -rf dist
fi

echo ""
echo "3. Verificando se há dist na raiz..."
if [ -d "/root/app/dist" ]; then
    echo "   ERRO: Pasta dist ainda existe em /root/app/dist"
    ls -la /root/app/ | grep dist
    exit 1
fi

echo ""
echo "4. Aguardando 2 segundos..."
sleep 2

echo ""
echo "2. Removendo TUDO do Nginx..."
sudo rm -rf /var/www/central-rnc/*
sudo find /var/www/central-rnc -mindepth 1 -delete 2>/dev/null || true

echo ""
echo "3. Copiando arquivos NOVOS..."
sudo cp -r dist/* /var/www/central-rnc/
echo "   Copiado"

echo ""
echo "4. Verificando arquivo JS no Nginx..."
NGINX_JS_FILE=$(find /var/www/central-rnc/assets -name "index-*.js" | head -1)
if [ -n "$NGINX_JS_FILE" ]; then
    NGINX_JS_NAME=$(basename "$NGINX_JS_FILE")
    NGINX_JS_SIZE=$(du -h "$NGINX_JS_FILE" | cut -f1)
    echo "   Arquivo: $NGINX_JS_NAME"
    echo "   Tamanho: $NGINX_JS_SIZE"
    
    if [ "$NGINX_JS_NAME" = "$JS_NAME" ]; then
        echo "   OK: Nome do arquivo confere com o build"
    else
        echo "   AVISO: Nome do arquivo diferente! Esperado: $JS_NAME, Encontrado: $NGINX_JS_NAME"
    fi
    
    if grep -q "LandingPagesAdmin\|FormsAdmin" "$NGINX_JS_FILE" 2>/dev/null; then
        echo "   OK: Arquivo JS no Nginx contem LandingPagesAdmin e FormsAdmin"
    else
        echo "   ERRO: Arquivo JS no Nginx NAO contem LandingPagesAdmin/FormsAdmin!"
        echo "   Tentando copiar novamente..."
        sudo rm -rf /var/www/central-rnc/assets/*
        sudo cp -r dist/assets/* /var/www/central-rnc/assets/
        
        # Verificar novamente
        NGINX_JS_FILE=$(find /var/www/central-rnc/assets -name "index-*.js" | head -1)
        if grep -q "LandingPagesAdmin\|FormsAdmin" "$NGINX_JS_FILE" 2>/dev/null; then
            echo "   OK: Agora contem LandingPagesAdmin e FormsAdmin"
        else
            echo "   ERRO: Ainda nao contem!"
        fi
    fi
else
    echo "   ERRO: Arquivo JS nao encontrado no Nginx!"
    echo "   Listando arquivos em /var/www/central-rnc/assets/..."
    sudo ls -la /var/www/central-rnc/assets/ 2>/dev/null || echo "   Pasta assets nao existe!"
fi

echo ""
echo "5. Ajustando permissoes..."
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

echo ""
echo "6. Limpando cache do Nginx..."
sudo systemctl reload nginx
sudo systemctl restart nginx

echo ""
echo "7. Verificando status do Nginx..."
sudo systemctl status nginx --no-pager | head -5

echo ""
echo "========================================"
echo "Atualizacao forçada concluida!"
echo "========================================"
'@

# Criar arquivo temporário
$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$forceUpdateScriptUnix = $forceUpdateScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $forceUpdateScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    # Enviar script para VPS
    Write-Host "Enviando script de atualizacao forçada..." -ForegroundColor Cyan
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/forcar-update.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/forcar-update.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/forcar-update.sh"
    }
    
    # Executar script na VPS
    Write-Host "Executando atualizacao forçada..." -ForegroundColor Cyan
    Write-Host ""
    
    Invoke-SSHCommand -Command "chmod +x $VPS_PATH/forcar-update.sh && bash $VPS_PATH/forcar-update.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Atualizacao forçada concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: https://central-rnc.com.br/admin" -ForegroundColor Cyan
Write-Host "IMPORTANTE: Limpe o cache do navegador (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host ""

