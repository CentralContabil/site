# Script para enviar o script de importação para a VPS
# Execute: .\enviar-script-importacao.ps1

$vpsIP = "72.60.155.69"
$vpsUser = "root"
$vpsPassword = "SUA_SENHA_VPS_AQUI"

Write-Host "📤 Enviando importar-dados-vps.js para VPS..." -ForegroundColor Cyan

# Enviar arquivo
scp importar-dados-vps.js ${vpsUser}@${vpsIP}:/root/app/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Arquivo enviado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos passos na VPS:" -ForegroundColor Yellow
    Write-Host "1. cd ~/app" -ForegroundColor White
    Write-Host "2. node importar-dados-vps.js" -ForegroundColor White
} else {
    Write-Host "❌ Erro ao enviar arquivo!" -ForegroundColor Red
}


