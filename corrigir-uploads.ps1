# Script para corrigir permissões de uploads na VPS
# Execute: .\corrigir-uploads.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "Corrigindo permissões de uploads na VPS..." -ForegroundColor Yellow
Write-Host ""

$remoteScript = @"
cd $VPS_PATH

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
fi

# 4. Ajustar permissões
echo 'Ajustando permissões...'
sudo chown -R www-data:www-data /var/www/central-rnc/uploads
sudo chmod -R 755 /var/www/central-rnc/uploads

# 5. Ajustar permissões do diretório da aplicação também
sudo chown -R root:root /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads

# 6. Verificar arquivos
echo ''
echo 'Arquivos na pasta uploads:'
ls -la /var/www/central-rnc/uploads/ | head -10

echo ''
echo 'Correcao concluida!'
"@

# Executar script na VPS
Write-Host "Executando correção na VPS..." -ForegroundColor Cyan

if (Get-Command sshpass -ErrorAction SilentlyContinue) {
    $env:SSHPASS = $VPS_PASS
    sshpass -e ssh "${VPS_USER}@${VPS_IP}" $remoteScript
} else {
    & ssh "${VPS_USER}@${VPS_IP}" $remoteScript
}

Write-Host ""
Write-Host "Correção concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Teste acessando: https://central-rnc.com.br/uploads/[nome-do-arquivo]" -ForegroundColor Cyan


