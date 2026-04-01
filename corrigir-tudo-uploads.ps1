# Script completo para corrigir uploads na VPS
# Execute: .\corrigir-tudo-uploads.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Correção Completa de Uploads na VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$remoteScript = @"
cd $VPS_PATH

echo '========================================'
echo '1. Corrigindo pasta uploads...'
echo '========================================'

# 1. Verificar se a pasta uploads existe
if [ ! -d "public/uploads" ]; then
    echo 'Criando pasta uploads...'
    mkdir -p public/uploads
fi

# 2. Criar pasta uploads no Nginx se não existir
echo 'Criando pasta uploads no Nginx...'
sudo mkdir -p /var/www/central-rnc/uploads

# 3. Copiar arquivos de upload para o diretório do Nginx
echo 'Copiando arquivos de upload...'
if [ -d "public/uploads" ] && [ "$(ls -A public/uploads 2>/dev/null)" ]; then
    sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    echo 'Arquivos copiados'
else
    echo 'Pasta uploads vazia ou não encontrada'
fi

# 4. Ajustar permissões
echo 'Ajustando permissões...'
sudo chown -R www-data:www-data /var/www/central-rnc/uploads
sudo chmod -R 755 /var/www/central-rnc/uploads
sudo chown -R root:root /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads

echo ''
echo '========================================'
echo '2. Verificando configuração do Nginx...'
echo '========================================'

NGINX_CONFIG="/etc/nginx/sites-available/central-rnc"
if [ -f "$NGINX_CONFIG" ]; then
    if grep -q "location /uploads" "$NGINX_CONFIG"; then
        echo 'Configuracao do Nginx para /uploads encontrada'
    else
        echo 'Adicionando configuracao do Nginx para /uploads...'
        # Criar backup
        sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup"
        
        # Adicionar configuração antes do fechamento do bloco server
        sudo sed -i '/^[[:space:]]*location \/ {/a\
    location /uploads {\
        alias /var/www/central-rnc/uploads;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
    }' "$NGINX_CONFIG"
        
        # Testar configuração
        if sudo nginx -t; then
            echo 'Configuracao do Nginx testada com sucesso'
            echo 'Recarregando Nginx...'
            sudo systemctl reload nginx
            echo 'Nginx recarregado'
        else
            echo 'ERRO: Configuracao do Nginx invalida!'
            echo 'Restaurando backup...'
            sudo cp "$NGINX_CONFIG.backup" "$NGINX_CONFIG"
        fi
    fi
else
    echo "ERRO: Arquivo de configuracao do Nginx nao encontrado: $NGINX_CONFIG"
fi

echo ''
echo '========================================'
echo '3. Verificando arquivos...'
echo '========================================'
echo 'Arquivos na pasta uploads do Nginx:'
ls -la /var/www/central-rnc/uploads/ | head -10

echo ''
echo '========================================'
echo 'Correcao concluida!'
echo '========================================'
"@

# Executar script na VPS
Write-Host "Executando correção completa na VPS..." -ForegroundColor Cyan
Write-Host ""

if (Get-Command sshpass -ErrorAction SilentlyContinue) {
    $env:SSHPASS = $VPS_PASS
    sshpass -e ssh "${VPS_USER}@${VPS_IP}" $remoteScript
} else {
    & ssh "${VPS_USER}@${VPS_IP}" $remoteScript
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Correção concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Teste acessando: https://central-rnc.com.br/uploads/[nome-do-arquivo]" -ForegroundColor Cyan
Write-Host ""


