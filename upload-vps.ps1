# Script PowerShell para upload de arquivos para VPS
# IP: 72.60.155.69
# Usuário: root
# Senha: SUA_SENHA_VPS_AQUI

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "🚀 Iniciando upload para VPS..." -ForegroundColor Green
Write-Host "IP: $VPS_IP" -ForegroundColor Yellow
Write-Host ""

# Instalar módulo Posh-SSH se não estiver instalado
if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
    Write-Host "📦 Instalando módulo Posh-SSH..." -ForegroundColor Yellow
    Install-Module -Name Posh-SSH -Force -Scope CurrentUser
}

Import-Module Posh-SSH

# Criar credenciais
$SecurePassword = ConvertTo-SecureString $VPS_PASS -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential($VPS_USER, $SecurePassword)

# Criar sessão SSH
Write-Host "🔐 Conectando à VPS..." -ForegroundColor Yellow
$Session = New-SSHSession -ComputerName $VPS_IP -Credential $Credential -AcceptKey

if ($Session) {
    Write-Host "✅ Conectado com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Lista de arquivos/pastas para enviar
    $ItemsToUpload = @(
        "./api",
        "./src",
        "./prisma",
        "./public",
        "./package.json",
        "./package-lock.json",
        "./tsconfig.json",
        "./vite.config.ts",
        "./tailwind.config.js",
        "./postcss.config.js",
        "./index.html"
    )
    
    Write-Host "📤 Enviando arquivos..." -ForegroundColor Yellow
    
    foreach ($Item in $ItemsToUpload) {
        if (Test-Path $Item) {
            Write-Host "   Enviando: $Item" -ForegroundColor Cyan
            
            if (Test-Path $Item -PathType Container) {
                # É um diretório
                $Destination = "$VPS_PATH/$(Split-Path $Item -Leaf)"
                Set-SCPItem -ComputerName $VPS_IP -Credential $Credential -LocalItem $Item -RemotePath $VPS_PATH -Recurse
            } else {
                # É um arquivo
                Set-SCPItem -ComputerName $VPS_IP -Credential $Credential -LocalItem $Item -RemotePath $VPS_PATH
            }
            
            Write-Host "   ✅ $Item enviado" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $Item não encontrado" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "✅ Upload concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos na VPS:" -ForegroundColor Yellow
    Write-Host "   1. cd ~/app" -ForegroundColor White
    Write-Host "   2. npm install" -ForegroundColor White
    Write-Host "   3. npm run build" -ForegroundColor White
    Write-Host "   4. pm2 start ecosystem.vps.config.js" -ForegroundColor White
    
    # Remover sessão
    Remove-SSHSession -SessionId $Session.SessionId | Out-Null
} else {
    Write-Host "❌ Erro ao conectar à VPS" -ForegroundColor Red
    exit 1
}


