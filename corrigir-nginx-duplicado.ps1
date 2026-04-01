# Script para corrigir rota duplicada /uploads no Nginx
# Execute: .\corrigir-nginx-duplicado.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Corrigindo Rota Duplicada no Nginx" -ForegroundColor Yellow
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

$fixScript = @'
echo "Corrigindo rota duplicada /uploads no Nginx..."
echo ""

NGINX_CONFIG="/etc/nginx/sites-available/central-rnc"

# Criar backup
sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo "Backup criado"

# Contar quantas vezes /uploads aparece
UPLOADS_COUNT=$(grep -c "location /uploads" "$NGINX_CONFIG" || echo "0")
echo "Rotas /uploads encontradas: $UPLOADS_COUNT"

if [ "$UPLOADS_COUNT" -gt 1 ]; then
    echo "Removendo todas as rotas /uploads..."
    # Remover todas as ocorrências de location /uploads e seu bloco
    sudo sed -i '/location \/uploads/,/^    }/d' "$NGINX_CONFIG"
    echo "Rotas duplicadas removidas"
fi

# Verificar se ainda existe
if ! grep -q "location /uploads" "$NGINX_CONFIG"; then
    echo "Adicionando rota /uploads na posicao correta (antes de location /)..."
    
    # Encontrar a linha de location / e adicionar antes
    sudo sed -i '/location \//i\
    # Uploads (arquivos enviados)\
    location /uploads {\
        alias /var/www/central-rnc/uploads;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
    }' "$NGINX_CONFIG"
    
    echo "Rota /uploads adicionada"
fi

echo ""
echo "Verificando configuracao..."
if sudo nginx -t; then
    echo "OK: Configuracao valida"
    echo ""
    echo "Recarregando Nginx..."
    sudo systemctl reload nginx
    echo "Nginx recarregado"
    
    echo ""
    echo "Verificando rotas /uploads..."
    grep -A 3 "location /uploads" "$NGINX_CONFIG" || echo "Nenhuma rota /uploads encontrada"
else
    echo "ERRO: Configuracao invalida!"
    echo "Restaurando backup..."
    sudo cp "$NGINX_CONFIG.backup."* "$NGINX_CONFIG" 2>/dev/null || true
    exit 1
fi

echo ""
echo "========================================"
echo "Correcao concluida!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$fixScriptUnix = $fixScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $fixScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Corrigindo configuracao..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/fix-nginx.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/fix-nginx.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/fix-nginx.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/fix-nginx.sh && bash /tmp/fix-nginx.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Correcao Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: Limpe o cache do navegador!" -ForegroundColor Yellow
Write-Host ""


