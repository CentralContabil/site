# Script para Atualizar Menu do Admin na VPS
# Execute: .\atualizar-menu-vps.ps1

Write-Host "Atualizando menu do admin na VPS..." -ForegroundColor Green
Write-Host ""

# 1. Build
Write-Host "1. Fazendo build do frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build falhou!" -ForegroundColor Red
    exit 1
}
Write-Host "   OK: Build concluido" -ForegroundColor Green
Write-Host ""

# 2. Instrucoes
Write-Host "2. Envie os arquivos para a VPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Opcao A - SCP (digite a senha quando solicitado):" -ForegroundColor Cyan
Write-Host "   scp -r dist/* root@72.60.155.69:/root/app/dist/" -ForegroundColor White
Write-Host ""
Write-Host "   Opcao B - WinSCP/FileZilla:" -ForegroundColor Cyan
Write-Host "   Host: 72.60.155.69" -ForegroundColor White
Write-Host "   Usuario: root" -ForegroundColor White
Write-Host "   Senha: SUA_SENHA_VPS_AQUI" -ForegroundColor White
Write-Host "   Enviar: dist/* para /root/app/dist/" -ForegroundColor White
Write-Host ""

# 3. Script para executar na VPS
Write-Host "3. Na VPS, execute:" -ForegroundColor Yellow
Write-Host ""
$script = @"
cd /root/app
sudo rm -rf /var/www/central-rnc/*
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc
sudo systemctl reload nginx
echo "Menu atualizado!"
"@

Write-Host $script -ForegroundColor White
Write-Host ""

# Salvar script para VPS
$script | Out-File -FilePath "atualizar-menu-vps-remoto.sh" -Encoding UTF8
Write-Host "   Script salvo em: atualizar-menu-vps-remoto.sh" -ForegroundColor Green
Write-Host "   Envie este arquivo para a VPS e execute: bash atualizar-menu-vps-remoto.sh" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Apos atualizar, limpe o cache do navegador:" -ForegroundColor Yellow
Write-Host "   - Pressione Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   - Ou pressione Ctrl+F5 na pagina do admin" -ForegroundColor White
Write-Host ""


