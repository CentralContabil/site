# Script PowerShell para enviar ecosystem.config.js para VPS
# Execute: .\enviar-ecosystem-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASSWORD = "SUA_SENHA_VPS_AQUI"

Write-Host "📤 Enviando ecosystem.config.js para VPS..." -ForegroundColor Cyan

# Copiar ecosystem.vps.config.js para ecosystem.config.js localmente primeiro
Copy-Item -Path "ecosystem.vps.config.js" -Destination "ecosystem.config.js" -Force

# Enviar para VPS usando SCP
$scpCommand = "scp ecosystem.config.js ${VPS_USER}@${VPS_IP}:/root/app/"

# Usar sshpass equivalente no Windows (se disponível) ou solicitar senha
Write-Host "⚠️  Será solicitada a senha da VPS: $VPS_PASSWORD" -ForegroundColor Yellow
Write-Host ""

# Tentar usar plink (PuTTY) se disponível, senão usar scp normal
if (Get-Command plink -ErrorAction SilentlyContinue) {
    echo y | plink -ssh -pw $VPS_PASSWORD $VPS_USER@$VPS_IP "mkdir -p /root/app"
    echo y | plink -ssh -pw $VPS_PASSWORD -batch $VPS_USER@$VPS_IP "cat > /root/app/ecosystem.config.js" < ecosystem.config.js
    Write-Host "✅ Arquivo enviado com sucesso!" -ForegroundColor Green
} else {
    # Usar SCP normal (solicitará senha)
    & $scpCommand
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Arquivo enviado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao enviar arquivo" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Próximos passos na VPS:" -ForegroundColor Cyan
Write-Host "   cd ~/app" -ForegroundColor White
Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor White
Write-Host "   pm2 save" -ForegroundColor White


