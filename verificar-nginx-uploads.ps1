# Script para verificar e corrigir configuração do Nginx para uploads
# Execute: .\verificar-nginx-uploads.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificando Nginx para Uploads" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar ferramentas
$hasSshpass = Get-Command sshpass -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue
$hasSsh = Get-Command ssh -ErrorAction SilentlyContinue

if (-not $hasSsh) {
    Write-Host "ERRO: SSH nao encontrado!" -ForegroundColor Red
    exit 1
}

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
echo "1. Verificando configuracao do Nginx..."
NGINX_CONFIG="/etc/nginx/sites-available/central-rnc"

if [ -f "$NGINX_CONFIG" ]; then
    echo "   Arquivo de configuracao encontrado"
    
    if grep -q "location /uploads" "$NGINX_CONFIG"; then
        echo "   OK: Configuracao para /uploads encontrada"
        echo ""
        echo "   Configuracao atual:"
        grep -A 3 "location /uploads" "$NGINX_CONFIG"
    else
        echo "   ERRO: Configuracao para /uploads NAO encontrada!"
        echo ""
        echo "   Adicionando configuracao..."
        
        # Criar backup
        sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Adicionar configuracao antes do fechamento do server block
        sudo sed -i '/^}$/i\
    location /uploads {\
        alias /var/www/central-rnc/uploads;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
    }' "$NGINX_CONFIG"
        
        echo "   Configuracao adicionada"
        echo ""
        echo "   Nova configuracao:"
        grep -A 3 "location /uploads" "$NGINX_CONFIG"
        
        echo ""
        echo "   Testando configuracao do Nginx..."
        if sudo nginx -t; then
            echo "   OK: Configuracao valida"
            echo ""
            echo "   Reiniciando Nginx..."
            sudo systemctl reload nginx
            echo "   Nginx reiniciado"
        else
            echo "   ERRO: Configuracao invalida!"
            echo "   Restaurando backup..."
            sudo cp "$NGINX_CONFIG.backup."* "$NGINX_CONFIG" 2>/dev/null || true
        fi
    fi
else
    echo "   ERRO: Arquivo de configuracao nao encontrado!"
fi

echo ""
echo "2. Verificando se arquivos estao acessiveis..."
if [ -d "/var/www/central-rnc/uploads" ]; then
    FILE_COUNT=$(find /var/www/central-rnc/uploads -type f | wc -l)
    echo "   Arquivos encontrados: $FILE_COUNT"
    
    if [ "$FILE_COUNT" -gt 0 ]; then
        FIRST_FILE=$(find /var/www/central-rnc/uploads -type f | head -1)
        FILE_NAME=$(basename "$FIRST_FILE")
        echo "   Testando: $FILE_NAME"
        
        # Testar acesso HTTP
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/uploads/$FILE_NAME" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "   OK: Arquivo acessivel via HTTP (200)"
        else
            echo "   AVISO: HTTP code: $HTTP_CODE"
        fi
    fi
else
    echo "   ERRO: Pasta /var/www/central-rnc/uploads nao existe!"
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
    Write-Host "Executando verificacao..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-nginx.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/check-nginx.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-nginx.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/check-nginx.sh && bash /tmp/check-nginx.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Verificacao Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
