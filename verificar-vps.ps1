# Script para verificar e corrigir problemas na VPS
# Execute: .\verificar-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificando e Corrigindo VPS" -ForegroundColor Yellow
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

# Ler o script bash
$scriptContent = Get-Content -Path "verificar-e-corrigir-vps.sh" -Raw -ErrorAction SilentlyContinue

if (-not $scriptContent) {
    Write-Host "AVISO: Script verificar-e-corrigir-vps.sh nao encontrado localmente" -ForegroundColor Yellow
    Write-Host "Executando comandos diretamente..." -ForegroundColor Cyan
    $scriptContent = @'
cd /root/app

echo "========================================"
echo "Verificando e Corrigindo VPS"
echo "========================================"
echo ""

# 1. Verificar pasta uploads
echo "1. Verificando pasta uploads..."
if [ -d "public/uploads" ]; then
    UPLOAD_COUNT=$(ls -1 public/uploads 2>/dev/null | wc -l)
    echo "   Arquivos em public/uploads: $UPLOAD_COUNT"
else
    echo "   AVISO: Pasta public/uploads nao existe!"
    mkdir -p public/uploads
fi

if [ -d "/var/www/central-rnc/uploads" ]; then
    NGINX_UPLOAD_COUNT=$(ls -1 /var/www/central-rnc/uploads 2>/dev/null | wc -l)
    echo "   Arquivos em /var/www/central-rnc/uploads: $NGINX_UPLOAD_COUNT"
else
    echo "   AVISO: Pasta /var/www/central-rnc/uploads nao existe!"
    sudo mkdir -p /var/www/central-rnc/uploads
fi

echo ""
echo "2. Corrigindo pasta uploads..."
mkdir -p public/uploads
sudo mkdir -p /var/www/central-rnc/uploads

if [ -d "public/uploads" ] && [ "$(ls -A public/uploads 2>/dev/null)" ]; then
    echo "   Copiando arquivos de upload para Nginx..."
    sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    echo "   Arquivos copiados"
fi

sudo chown -R www-data:www-data /var/www/central-rnc/uploads
sudo chmod -R 755 /var/www/central-rnc/uploads
sudo chown -R root:root /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads

echo ""
echo "3. Verificando configuracao do Nginx..."
NGINX_CONFIG="/etc/nginx/sites-available/central-rnc"
if [ -f "$NGINX_CONFIG" ]; then
    if grep -q "location /uploads" "$NGINX_CONFIG"; then
        echo "   Configuracao do Nginx para /uploads encontrada"
    else
        echo "   Adicionando configuracao do Nginx para /uploads..."
        sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup"
        sudo sed -i '/^[[:space:]]*location \/ {/a\
    location /uploads {\
        alias /var/www/central-rnc/uploads;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
    }' "$NGINX_CONFIG"
        
        if sudo nginx -t; then
            echo "   Configuracao do Nginx testada com sucesso"
            sudo systemctl reload nginx
            echo "   Nginx recarregado"
        else
            echo "   ERRO: Configuracao do Nginx invalida! Restaurando backup..."
            sudo cp "$NGINX_CONFIG.backup" "$NGINX_CONFIG"
        fi
    fi
fi

echo ""
echo "4. Verificando dados no banco..."
if [ -f "importar-dados-vps.js" ] && [ -d "dados_exportados" ]; then
    echo "   Reimportando dados..."
    node importar-dados-vps.js
else
    echo "   AVISO: Script de importacao ou dados nao encontrados"
fi

echo ""
echo "5. Reiniciando aplicacao..."
pm2 restart central-rnc
pm2 status

echo ""
echo "========================================"
echo "Verificacao concluida!"
echo "========================================"
'@
}

# Criar arquivo temporário
$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
[System.IO.File]::WriteAllText($tempScriptFile, $scriptContent, [System.Text.Encoding]::UTF8)

try {
    # Enviar script para VPS
    Write-Host "Enviando script para VPS..." -ForegroundColor Cyan
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/verificar-vps.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/verificar-vps.sh"
        cmd /c $pscpCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/verificar-vps.sh"
    }
    
    # Executar script na VPS
    Write-Host "Executando verificacao na VPS..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e ssh "${VPS_USER}@${VPS_IP}" "chmod +x ${VPS_PATH}/verificar-vps.sh && bash ${VPS_PATH}/verificar-vps.sh"
    } elseif ($hasPlink) {
        $plinkCommand = "plink -ssh -pw `"$VPS_PASS`" -batch ${VPS_USER}@${VPS_IP} `"chmod +x ${VPS_PATH}/verificar-vps.sh && bash ${VPS_PATH}/verificar-vps.sh`""
        cmd /c $plinkCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & ssh "${VPS_USER}@${VPS_IP}" "chmod +x ${VPS_PATH}/verificar-vps.sh && bash ${VPS_PATH}/verificar-vps.sh"
    }
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Verificacao concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


