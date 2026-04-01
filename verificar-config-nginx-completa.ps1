# Script para verificar configuração completa do Nginx
# Execute: .\verificar-config-nginx-completa.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificando Configuracao Completa do Nginx" -ForegroundColor Yellow
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
echo "1. Mostrando configuracao completa do Nginx para central-rnc..."
echo ""
NGINX_CONFIG="/etc/nginx/sites-available/central-rnc"
cat "$NGINX_CONFIG"

echo ""
echo "========================================"
echo "2. Verificando se a rota /uploads esta antes da rota principal..."
echo ""

# Verificar ordem das rotas
UPLOADS_LINE=$(grep -n "location /uploads" "$NGINX_CONFIG" | cut -d: -f1)
ROOT_LINE=$(grep -n "location /" "$NGINX_CONFIG" | head -1 | cut -d: -f1)

if [ -n "$UPLOADS_LINE" ] && [ -n "$ROOT_LINE" ]; then
    if [ "$UPLOADS_LINE" -lt "$ROOT_LINE" ]; then
        echo "   OK: Rota /uploads esta antes da rota /"
    else
        echo "   ERRO: Rota /uploads esta DEPOIS da rota /"
        echo "   Isso pode causar problemas! A rota /uploads deve vir ANTES da rota /"
        echo ""
        echo "   Corrigindo ordem das rotas..."
        
        # Criar backup
        sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Remover configuração de uploads
        sudo sed -i '/location \/uploads/,/^    }/d' "$NGINX_CONFIG"
        
        # Adicionar antes da rota /
        sudo sed -i '/location \//i\
    location /uploads {\
        alias /var/www/central-rnc/uploads;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
    }' "$NGINX_CONFIG"
        
        echo "   Configuracao corrigida"
        
        # Testar
        if sudo nginx -t; then
            echo "   OK: Configuracao valida"
            sudo systemctl reload nginx
            echo "   Nginx recarregado"
        else
            echo "   ERRO: Configuracao invalida! Restaurando backup..."
            sudo cp "$NGINX_CONFIG.backup."* "$NGINX_CONFIG" 2>/dev/null || true
        fi
    fi
fi

echo ""
echo "========================================"
echo "3. Testando acesso direto a um arquivo..."
echo ""
TEST_FILE=$(find /var/www/central-rnc/uploads -type f | head -1)
if [ -n "$TEST_FILE" ]; then
    FILE_NAME=$(basename "$TEST_FILE")
    echo "   Arquivo: $FILE_NAME"
    echo "   Caminho completo: $TEST_FILE"
    echo ""
    echo "   Testando via curl com Host header..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: central-rnc.com.br" "http://localhost/uploads/$FILE_NAME" 2>/dev/null || echo "000")
    echo "   HTTP Code: $HTTP_CODE"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   OK: Arquivo acessivel!"
    else
        echo "   AVISO: Arquivo nao acessivel via HTTP"
        echo "   Verificando se o arquivo existe..."
        if [ -f "$TEST_FILE" ]; then
            echo "   Arquivo existe no sistema de arquivos"
            echo "   Verificando permissoes..."
            ls -la "$TEST_FILE"
        fi
    fi
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
    Write-Host "Verificando configuracao..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-full-nginx.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/check-full-nginx.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-full-nginx.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/check-full-nginx.sh && bash /tmp/check-full-nginx.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Verificacao Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


