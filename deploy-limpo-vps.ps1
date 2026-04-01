# Script de Deploy LIMPO - Limpa tudo antes de fazer build
# Execute: .\deploy-limpo-vps.ps1

$ErrorActionPreference = "Stop"

# Configurações da VPS
$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"
$DOMAIN = "central-rnc.com.br"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy LIMPO para VPS" -ForegroundColor Yellow
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
# ETAPA 1: Limpar TUDO localmente
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 1: Limpando build e cache local" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Limpar pasta dist
if (Test-Path "dist") {
    Write-Host "Removendo pasta dist..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "dist"
    Write-Host "   OK: dist removida" -ForegroundColor Green
}

# Limpar cache do Vite
if (Test-Path "node_modules/.vite") {
    Write-Host "Removendo cache do Vite..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules/.vite" -ErrorAction SilentlyContinue
    Write-Host "   OK: cache do Vite removido" -ForegroundColor Green
}

# Limpar node_modules/.cache se existir
if (Test-Path "node_modules/.cache") {
    Write-Host "Removendo cache do node_modules..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
    Write-Host "   OK: cache removido" -ForegroundColor Green
}

Write-Host ""
Write-Host "Limpeza concluida!" -ForegroundColor Green
Write-Host ""

# ========================================
# ETAPA 2: Build LIMPO do Frontend
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 2: Build LIMPO do Frontend" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fazendo build limpo do frontend..." -ForegroundColor Cyan
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
Write-Host ""

# Forçar build limpo (sem cache)
$env:NODE_ENV = "production"
# Limpar variáveis de ambiente que podem causar cache
$env:VITE_CACHE_DIR = $null
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

# Verificar tamanho da pasta dist
$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Tamanho da pasta dist: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""

# ========================================
# ETAPA 3: Enviar Frontend para VPS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 3: Enviar Frontend para VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Enviando pasta dist para a VPS..." -ForegroundColor Cyan
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "   Enviando: dist" -ForegroundColor Gray
    Send-ToVPS -LocalPath "dist" -RemotePath "$VPS_PATH/"
    Write-Host "   OK: dist enviado" -ForegroundColor Green
} catch {
    Write-Host "   ERRO ao enviar dist: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Arquivos enviados com sucesso!" -ForegroundColor Green
Write-Host ""

# ========================================
# ETAPA 4: Atualizar Frontend na VPS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "ETAPA 4: Atualizar Frontend na VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Executando comandos na VPS..." -ForegroundColor Cyan
Write-Host ""

$remoteScript = @'
cd /root/app

echo "1. Verificando se dist existe..."
if [ ! -d "dist" ]; then
    echo "   ERRO: Pasta dist nao encontrada!"
    exit 1
fi

echo "   OK: Pasta dist encontrada"
JS_FILE=$(find dist/assets -name "index-*.js" | head -1)
if [ -n "$JS_FILE" ]; then
    JS_NAME=$(basename "$JS_FILE")
    echo "   Arquivo JS encontrado: $JS_NAME"
    if grep -q "LandingPagesAdmin\|FormsAdmin" "$JS_FILE" 2>/dev/null; then
        echo "   OK: Arquivo JS contem LandingPagesAdmin e FormsAdmin"
    else
        echo "   AVISO: Arquivo JS pode nao conter LandingPagesAdmin/FormsAdmin"
    fi
fi

echo ""
echo "2. Fazendo backup do frontend atual..."
sudo cp -r /var/www/central-rnc /var/www/central-rnc.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

echo ""
echo "3. Removendo frontend antigo COMPLETAMENTE..."
sudo rm -rf /var/www/central-rnc/*
sudo rm -rf /var/www/central-rnc/.*

echo ""
echo "4. Copiando novo frontend..."
sudo cp -r dist/* /var/www/central-rnc/
sudo cp -r dist/. /var/www/central-rnc/ 2>/dev/null || true
echo "   Arquivos copiados"

echo ""
echo "5. Verificando arquivos copiados..."
if [ -f "/var/www/central-rnc/index.html" ]; then
    echo "   OK: index.html copiado"
else
    echo "   ERRO: index.html nao foi copiado!"
fi

NGINX_JS_FILE=$(find /var/www/central-rnc/assets -name "index-*.js" | head -1)
if [ -n "$NGINX_JS_FILE" ]; then
    NGINX_JS_NAME=$(basename "$NGINX_JS_FILE")
    echo "   Arquivo JS no Nginx: $NGINX_JS_NAME"
    if grep -q "LandingPagesAdmin\|FormsAdmin" "$NGINX_JS_FILE" 2>/dev/null; then
        echo "   OK: Arquivo JS no Nginx contem LandingPagesAdmin e FormsAdmin"
    else
        echo "   ERRO: Arquivo JS no Nginx NAO contem LandingPagesAdmin/FormsAdmin!"
    fi
else
    echo "   ERRO: Arquivo JS nao encontrado no Nginx!"
fi

echo ""
echo "6. Ajustando permissoes..."
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

echo ""
echo "7. Verificando pasta uploads..."
if [ -d "public/uploads" ]; then
    sudo mkdir -p /var/www/central-rnc/uploads
    if [ "$(ls -A public/uploads 2>/dev/null)" ]; then
        sudo cp -r public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    fi
    sudo chown -R www-data:www-data /var/www/central-rnc/uploads
    sudo chmod -R 755 /var/www/central-rnc/uploads
fi

echo ""
echo "8. Limpando cache do Nginx..."
sudo systemctl reload nginx

echo ""
echo "========================================"
echo "Frontend atualizado com sucesso!"
echo "========================================"
'@

# Criar arquivo temporário
$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
# Converter CRLF para LF (Unix line endings)
$remoteScriptUnix = $remoteScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $remoteScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    # Enviar script para VPS
    Write-Host "   Enviando script de atualizacao..." -ForegroundColor Gray
    Send-ToVPS -LocalPath $tempScriptFile -RemotePath "$VPS_PATH/atualizar-frontend-limpo.sh"
    
    # Executar script na VPS
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e ssh "${VPS_USER}@${VPS_IP}" "chmod +x $VPS_PATH/atualizar-frontend-limpo.sh && bash $VPS_PATH/atualizar-frontend-limpo.sh"
    } elseif ($hasPlink) {
        $plinkCommand = "plink -ssh -pw `"$VPS_PASS`" -batch ${VPS_USER}@${VPS_IP} `"chmod +x $VPS_PATH/atualizar-frontend-limpo.sh && bash $VPS_PATH/atualizar-frontend-limpo.sh`""
        cmd /c $plinkCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & ssh "${VPS_USER}@${VPS_IP}" "chmod +x $VPS_PATH/atualizar-frontend-limpo.sh && bash $VPS_PATH/atualizar-frontend-limpo.sh"
    }
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deploy LIMPO Concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: https://$DOMAIN/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Limpe o cache do navegador!" -ForegroundColor Yellow
Write-Host "   1. Pressione Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   2. Selecione 'Imagens e arquivos em cache'" -ForegroundColor White
Write-Host "   3. Clique em 'Limpar dados'" -ForegroundColor White
Write-Host "   4. Ou use Ctrl+F5 para forcar recarregamento" -ForegroundColor White
Write-Host "   5. Ou abra em uma janela anonima/privada" -ForegroundColor White
Write-Host ""

