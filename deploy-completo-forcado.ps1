# Script de Deploy Completo FORÇADO - Garante que tudo seja atualizado
# Execute: .\deploy-completo-forcado.ps1

$ErrorActionPreference = "Stop"

# Configurações da VPS
$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"
$DOMAIN = "central-rnc.com.br"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Completo FORCADO para VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Verificar ferramentas disponíveis
$hasSshpass = Get-Command sshpass -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue
$hasSsh = Get-Command ssh -ErrorAction SilentlyContinue
$hasScp = Get-Command scp -ErrorAction SilentlyContinue

if (-not $hasSsh -or -not $hasScp) {
    Write-Host "ERRO: SSH ou SCP nao encontrados!" -ForegroundColor Red
    exit 1
}

# Função para enviar arquivo/pasta via SCP
function Send-ToVPS {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" -r `"$LocalPath`" ${VPS_USER}@${VPS_IP}:${RemotePath}"
        cmd /c $pscpCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    }
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

# ========================================
# ETAPA 1: Limpar build anterior
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 1: Limpando build anterior" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "Pasta dist removida" -ForegroundColor Green
}
Write-Host ""

# ========================================
# ETAPA 2: Build do Frontend
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 2: Build do Frontend" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fazendo build do frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no build do frontend!" -ForegroundColor Red
    exit 1
}
Write-Host "Build concluido" -ForegroundColor Green
Write-Host ""

# Verificar se dist/ foi criado
if (-not (Test-Path "dist")) {
    Write-Host "ERRO: Pasta 'dist' nao foi criada!" -ForegroundColor Red
    exit 1
}

# ========================================
# ETAPA 3: Enviar TODOS os arquivos
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 3: Enviar TODOS os arquivos" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Enviando arquivos para a VPS..." -ForegroundColor Cyan
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
Write-Host ""

$filesToUpload = @(
    "src",
    "api",
    "prisma",
    "public",
    "dist",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html",
    "ecosystem.config.cjs"
)

foreach ($item in $filesToUpload) {
    if (Test-Path $item) {
        try {
            Write-Host "   Enviando: $item" -ForegroundColor Gray
            Send-ToVPS -LocalPath $item -RemotePath "$VPS_PATH/"
            Write-Host "   OK: $item enviado" -ForegroundColor Green
        } catch {
            Write-Host "   ERRO ao enviar $item : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   AVISO: $item nao encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Arquivos enviados!" -ForegroundColor Green
Write-Host ""

# ========================================
# ETAPA 4: Configurar VPS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 4: Configurar VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Executando comandos na VPS..." -ForegroundColor Cyan
Write-Host ""

$remoteScript = @'
cd /root/app

echo "1. Atualizando schema para PostgreSQL..."
if [ -f prisma/schema.production.prisma ]; then
    cp prisma/schema.production.prisma prisma/schema.prisma
fi

echo ""
echo "2. Instalando dependencias..."
npm install

echo ""
echo "3. Regenerando Prisma Client..."
rm -rf node_modules/.prisma
npx prisma generate

echo ""
echo "4. Aplicando migracoes..."
npx prisma db push --accept-data-loss

echo ""
echo "5. Copiando arquivos estaticos para Nginx..."
sudo rm -rf /var/www/central-rnc/*
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

echo ""
echo "6. Corrigindo pasta uploads..."
mkdir -p public/uploads
sudo mkdir -p /var/www/central-rnc/uploads
if [ "$(ls -A public/uploads 2>/dev/null)" ]; then
    sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
fi
sudo chown -R www-data:www-data /var/www/central-rnc/uploads
sudo chmod -R 755 /var/www/central-rnc/uploads

echo ""
echo "7. Configurando Nginx para uploads..."
NGINX_CONFIG="/etc/nginx/sites-available/central-rnc"
if [ -f "$NGINX_CONFIG" ] && ! grep -q "location /uploads" "$NGINX_CONFIG"; then
    sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup"
    sudo sed -i '/^[[:space:]]*location \/ {/a\
    location /uploads {\
        alias /var/www/central-rnc/uploads;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
    }' "$NGINX_CONFIG"
    if sudo nginx -t; then
        sudo systemctl reload nginx
    else
        sudo cp "$NGINX_CONFIG.backup" "$NGINX_CONFIG"
    fi
fi

echo ""
echo "8. Limpando cache do Nginx..."
sudo systemctl reload nginx

echo ""
echo "9. Reiniciando aplicacao..."
pm2 restart central-rnc || pm2 start ecosystem.config.cjs --name central-rnc
pm2 save

echo ""
echo "10. Status final:"
pm2 status

echo ""
echo "========================================"
echo "Deploy concluido!"
echo "========================================"
'@

# Criar arquivo temporário
$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
# Converter CRLF para LF (Unix line endings)
$remoteScriptUnix = $remoteScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $remoteScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    # Enviar script para VPS
    Write-Host "   Enviando script de configuracao..." -ForegroundColor Gray
    Send-ToVPS -LocalPath $tempScriptFile -RemotePath "$VPS_PATH/deploy-forcado.sh"
    
    # Executar script na VPS
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e ssh "${VPS_USER}@${VPS_IP}" "chmod +x $VPS_PATH/deploy-forcado.sh && bash $VPS_PATH/deploy-forcado.sh"
    } elseif ($hasPlink) {
        $plinkCommand = "plink -ssh -pw `"$VPS_PASS`" -batch ${VPS_USER}@${VPS_IP} `"chmod +x $VPS_PATH/deploy-forcado.sh && bash $VPS_PATH/deploy-forcado.sh`""
        cmd /c $plinkCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & ssh "${VPS_USER}@${VPS_IP}" "chmod +x $VPS_PATH/deploy-forcado.sh && bash $VPS_PATH/deploy-forcado.sh"
    }
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deploy Completo Concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: https://$DOMAIN/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Limpe o cache do navegador!" -ForegroundColor Yellow
Write-Host "   - Pressione Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   - Ou use Ctrl+F5 para forcar recarregamento" -ForegroundColor White
Write-Host ""

