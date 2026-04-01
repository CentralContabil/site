# Script de Deploy Completo para VPS Hostinger
# Execute: .\deploy-vps-completo.ps1

$ErrorActionPreference = "Stop"

# Configurações da VPS
$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"
$DOMAIN = "central-rnc.com.br"

Write-Host "Iniciando deploy completo para producao..." -ForegroundColor Green
Write-Host "Servidor: $VPS_IP" -ForegroundColor Cyan
Write-Host "Usuario: $VPS_USER" -ForegroundColor Cyan
Write-Host "Diretorio: $VPS_PATH" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# 1. Build do Frontend
Write-Host "Fazendo build do frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer build do frontend!" -ForegroundColor Red
    exit 1
}
Write-Host "Build concluido" -ForegroundColor Green
Write-Host ""

# 2. Verificar se dist/ foi criado
if (-not (Test-Path "dist")) {
    Write-Host "ERRO: Pasta 'dist' nao foi criada!" -ForegroundColor Red
    exit 1
}

# 3. Lista de arquivos e pastas para enviar
Write-Host "Preparando arquivos para upload..." -ForegroundColor Yellow
$filesToUpload = @(
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

# Verificar se todos os arquivos existem
foreach ($file in $filesToUpload) {
    if (-not (Test-Path $file)) {
        Write-Host "AVISO: $file nao encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Enviando arquivos para a VPS..." -ForegroundColor Yellow
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
Write-Host ""

# Função para enviar arquivo/pasta via SCP
function Send-ToVPS {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    $scpCommand = "scp -r `"$LocalPath`" ${VPS_USER}@${VPS_IP}:${RemotePath}"
    
    # Usar sshpass se disponível, senão pedir senha
    if (Get-Command sshpass -ErrorAction SilentlyContinue) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    } else {
        Write-Host "   Enviando: $LocalPath" -ForegroundColor Gray
        & scp -r "$LocalPath" "${VPS_USER}@${VPS_IP}:${RemotePath}"
    }
}

# Enviar cada arquivo/pasta
foreach ($item in $filesToUpload) {
    if (Test-Path $item) {
        try {
            if (Test-Path $item -PathType Container) {
                # É uma pasta
                Send-ToVPS -LocalPath $item -RemotePath "$VPS_PATH/"
            } else {
                # É um arquivo
                Send-ToVPS -LocalPath $item -RemotePath "$VPS_PATH/"
            }
            Write-Host "   OK: $item enviado" -ForegroundColor Green
        } catch {
            Write-Host "   ERRO ao enviar $item : $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Executando comandos na VPS..." -ForegroundColor Yellow
Write-Host ""

# Script para executar na VPS
$remoteScript = @"
cd $VPS_PATH

# 1. Fazer backup do schema atual
echo 'Fazendo backup do schema...'
cp prisma/schema.prisma prisma/schema.prisma.backup 2>/dev/null || true

# 2. Substituir schema pelo de producao (se necessario)
if [ -f prisma/schema.production.prisma ]; then
    echo 'Atualizando schema para PostgreSQL...'
    cp prisma/schema.production.prisma prisma/schema.prisma
fi

# 3. Instalar dependencias
echo 'Instalando dependencias...'
npm install

# 4. Gerar Prisma Client
echo 'Gerando Prisma Client...'
npx prisma generate

# 5. Aplicar migracoes do banco
echo 'Aplicando migracoes do banco de dados...'
npx prisma db push --accept-data-loss || npx prisma migrate deploy

# 6. Copiar arquivos estaticos para Nginx
echo 'Copiando arquivos estaticos...'
sudo rm -rf /var/www/central-rnc/*
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

# 6.1. Corrigir pasta uploads
echo 'Corrigindo pasta uploads...'
if [ -d "public/uploads" ]; then
    # Criar pasta uploads no Nginx se não existir
    sudo mkdir -p /var/www/central-rnc/uploads
    # Copiar arquivos existentes
    if [ "$(ls -A public/uploads 2>/dev/null)" ]; then
        sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    fi
    # Ajustar permissões
    sudo chown -R www-data:www-data /var/www/central-rnc/uploads
    sudo chmod -R 755 /var/www/central-rnc/uploads
    echo 'Pasta uploads configurada'
else
    echo 'Criando pasta uploads...'
    mkdir -p public/uploads
    sudo mkdir -p /var/www/central-rnc/uploads
    sudo chown -R www-data:www-data /var/www/central-rnc/uploads
    sudo chmod -R 755 /var/www/central-rnc/uploads
fi

# 7. Reiniciar aplicacao PM2
echo 'Reiniciando aplicacao...'
pm2 restart central-rnc || pm2 start ecosystem.config.cjs --name central-rnc
pm2 save

# 8. Verificar status
echo ''
echo 'Deploy concluido!'
echo ''
echo 'Status da aplicacao:'
pm2 status
echo ''
echo 'Para ver os logs:'
echo '   pm2 logs central-rnc --lines 50'
echo ''
"@

# Executar script na VPS
Write-Host "   Executando comandos remotos..." -ForegroundColor Gray
$sshCommand = "ssh ${VPS_USER}@${VPS_IP} `"$remoteScript`""

if (Get-Command sshpass -ErrorAction SilentlyContinue) {
    $env:SSHPASS = $VPS_PASS
    sshpass -e ssh "${VPS_USER}@${VPS_IP}" "$remoteScript"
} else {
    & ssh "${VPS_USER}@${VPS_IP}" $remoteScript
}

Write-Host ""
Write-Host "Deploy concluido com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "   1. Verifique os logs: ssh $VPS_USER@$VPS_IP 'pm2 logs central-rnc --lines 50'" -ForegroundColor White
Write-Host "   2. Teste a API: curl https://$DOMAIN/api/health" -ForegroundColor White
Write-Host "   3. Acesse o site: https://$DOMAIN" -ForegroundColor White
Write-Host ""
Write-Host "Para verificar se tudo esta funcionando:" -ForegroundColor Cyan
Write-Host "   ssh $VPS_USER@$VPS_IP 'pm2 status'" -ForegroundColor White
Write-Host ""

