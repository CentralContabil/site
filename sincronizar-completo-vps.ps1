# Script Completo de Sincronização: Localhost -> VPS
# Sincroniza arquivos e banco de dados
# Execute: .\sincronizar-completo-vps.ps1

$ErrorActionPreference = "Stop"

# Configurações da VPS
$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"
$DOMAIN = "central-rnc.com.br"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sincronizacao Completa: Localhost -> VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servidor: $VPS_IP" -ForegroundColor Cyan
Write-Host "Usuario: $VPS_USER" -ForegroundColor Cyan
Write-Host "Diretorio: $VPS_PATH" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Função para executar comandos SSH com senha
function Invoke-SSHCommand {
    param(
        [string]$Command
    )
    
    if (Get-Command sshpass -ErrorAction SilentlyContinue) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e ssh "${VPS_USER}@${VPS_IP}" $Command
    } else {
        Write-Host "AVISO: sshpass nao encontrado. Voce precisara informar a senha manualmente." -ForegroundColor Yellow
        & ssh "${VPS_USER}@${VPS_IP}" $Command
    }
}

# Função para enviar arquivo/pasta via SCP com senha
function Send-ToVPS {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    if (Get-Command sshpass -ErrorAction SilentlyContinue) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    } else {
        Write-Host "   Enviando: $LocalPath" -ForegroundColor Gray
        & scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    }
}

# ========================================
# ETAPA 1: Build do Frontend
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 1: Build do Frontend" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fazendo build do frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no build do frontend!" -ForegroundColor Red
    exit 1
}
Write-Host "Build concluido" -ForegroundColor Green
Write-Host ""

# ========================================
# ETAPA 2: Exportar Banco de Dados Local
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 2: Exportar Banco de Dados Local" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Exportando dados do banco local..." -ForegroundColor Cyan

# Limpar exportação anterior
if (Test-Path "dados_exportados") {
    Remove-Item -Recurse -Force "dados_exportados"
    Write-Host "Pasta dados_exportados anterior removida" -ForegroundColor Gray
}

# Executar script de exportação
node exportar-dados-local.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha na exportacao do banco de dados!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "dados_exportados")) {
    Write-Host "ERRO: Pasta dados_exportados nao foi criada!" -ForegroundColor Red
    exit 1
}

Write-Host "Exportacao concluida" -ForegroundColor Green
Write-Host ""

# ========================================
# ETAPA 3: Enviar Arquivos para VPS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 3: Enviar Arquivos para VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Preparando arquivos para upload..." -ForegroundColor Cyan

$filesToUpload = @(
    "api",
    "prisma",
    "public",
    "dist",
    "dados_exportados",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html",
    "ecosystem.config.cjs",
    "exportar-dados-local.js",
    "importar-dados-vps.js"
)

# Verificar se todos os arquivos existem
foreach ($file in $filesToUpload) {
    if (-not (Test-Path $file)) {
        Write-Host "AVISO: $file nao encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Enviando arquivos para a VPS..." -ForegroundColor Cyan
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
Write-Host ""

# Enviar cada arquivo/pasta
foreach ($item in $filesToUpload) {
    if (Test-Path $item) {
        try {
            Write-Host "   Enviando: $item" -ForegroundColor Gray
            Send-ToVPS -LocalPath $item -RemotePath "$VPS_PATH/"
            Write-Host "   OK: $item enviado" -ForegroundColor Green
        } catch {
            Write-Host "   ERRO ao enviar $item : $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Arquivos enviados com sucesso!" -ForegroundColor Green
Write-Host ""

# ========================================
# ETAPA 4: Executar Scripts na VPS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 4: Configurar e Sincronizar VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Executando comandos na VPS..." -ForegroundColor Cyan
Write-Host ""

$remoteScript = @"
cd $VPS_PATH

echo '========================================'
echo '1. Fazendo backup do schema atual...'
echo '========================================'
cp prisma/schema.prisma prisma/schema.prisma.backup 2>/dev/null || true

echo ''
echo '========================================'
echo '2. Atualizando schema para PostgreSQL...'
echo '========================================'
if [ -f prisma/schema.production.prisma ]; then
    cp prisma/schema.production.prisma prisma/schema.prisma
    echo 'Schema de producao aplicado'
else
    echo 'AVISO: schema.production.prisma nao encontrado'
fi

echo ''
echo '========================================'
echo '3. Instalando dependencias...'
echo '========================================'
npm install

echo ''
echo '========================================'
echo '4. Gerando Prisma Client...'
echo '========================================'
rm -rf node_modules/.prisma
npx prisma generate

echo ''
echo '========================================'
echo '5. Aplicando migracoes do banco...'
echo '========================================'
npx prisma db push --accept-data-loss || npx prisma migrate deploy

echo ''
echo '========================================'
echo '6. Importando dados do banco local...'
echo '========================================'
if [ -f "importar-dados-vps.js" ] && [ -d "dados_exportados" ]; then
    node importar-dados-vps.js
    echo 'Importacao concluida'
else
    echo 'AVISO: Script de importacao ou dados nao encontrados'
fi

echo ''
echo '========================================'
echo '7. Copiando arquivos estaticos para Nginx...'
echo '========================================'
sudo rm -rf /var/www/central-rnc/*
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

echo ''
echo '========================================'
echo '8. Corrigindo pasta uploads...'
echo '========================================'
if [ -d "public/uploads" ]; then
    sudo mkdir -p /var/www/central-rnc/uploads
    if [ "$(ls -A public/uploads 2>/dev/null)" ]; then
        sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    fi
    sudo chown -R www-data:www-data /var/www/central-rnc/uploads
    sudo chmod -R 755 /var/www/central-rnc/uploads
    echo 'Pasta uploads configurada'
else
    mkdir -p public/uploads
    sudo mkdir -p /var/www/central-rnc/uploads
    sudo chown -R www-data:www-data /var/www/central-rnc/uploads
    sudo chmod -R 755 /var/www/central-rnc/uploads
    echo 'Pasta uploads criada'
fi

echo ''
echo '========================================'
echo '9. Verificando/configurando Nginx para uploads...'
echo '========================================'
NGINX_CONFIG="/etc/nginx/sites-available/central-rnc"
if [ -f "$NGINX_CONFIG" ]; then
    if grep -q "location /uploads" "$NGINX_CONFIG"; then
        echo 'Configuracao do Nginx para /uploads ja existe'
    else
        echo 'Adicionando configuracao do Nginx para /uploads...'
        sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup"
        sudo sed -i '/^[[:space:]]*location \/ {/a\
    location /uploads {\
        alias /var/www/central-rnc/uploads;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
    }' "$NGINX_CONFIG"
        
        if sudo nginx -t; then
            echo 'Configuracao do Nginx testada com sucesso'
            sudo systemctl reload nginx
            echo 'Nginx recarregado'
        else
            echo 'ERRO: Configuracao do Nginx invalida! Restaurando backup...'
            sudo cp "$NGINX_CONFIG.backup" "$NGINX_CONFIG"
        fi
    fi
else
    echo "AVISO: Arquivo de configuracao do Nginx nao encontrado: $NGINX_CONFIG"
fi

echo ''
echo '========================================'
echo '10. Reiniciando aplicacao PM2...'
echo '========================================'
pm2 restart central-rnc || pm2 start ecosystem.config.cjs --name central-rnc
pm2 save

echo ''
echo '========================================'
echo '11. Verificando status...'
echo '========================================'
echo 'Status da aplicacao:'
pm2 status

echo ''
echo '========================================'
echo 'Sincronizacao concluida!'
echo '========================================'
echo ''
echo 'Para ver os logs:'
echo '   pm2 logs central-rnc --lines 50'
echo ''
"@

# Executar script na VPS
Write-Host "Executando comandos remotos..." -ForegroundColor Cyan
Invoke-SSHCommand -Command $remoteScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Sincronizacao Completa Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "   1. Verifique os logs: ssh $VPS_USER@$VPS_IP 'pm2 logs central-rnc --lines 50'" -ForegroundColor White
Write-Host "   2. Teste a API: curl https://$DOMAIN/api/health" -ForegroundColor White
Write-Host "   3. Acesse o site: https://$DOMAIN" -ForegroundColor White
Write-Host ""
Write-Host "Para verificar se tudo esta funcionando:" -ForegroundColor Cyan
Write-Host "   ssh $VPS_USER@$VPS_IP 'pm2 status'" -ForegroundColor White
Write-Host ""


