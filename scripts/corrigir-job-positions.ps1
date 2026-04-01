# Script PowerShell para corrigir Job Positions

Write-Host "🔧 Corrigindo configuração de Job Positions..." -ForegroundColor Cyan
Write-Host ""

# 1. Regenerar Prisma Client
Write-Host "1️⃣  Regenerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao regenerar Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma Client regenerado" -ForegroundColor Green
Write-Host ""

# 2. Aplicar mudanças no banco
Write-Host "2️⃣  Aplicando mudanças no banco de dados..." -ForegroundColor Yellow
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao aplicar mudanças no banco" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Banco de dados atualizado" -ForegroundColor Green
Write-Host ""

# 3. Executar seed
Write-Host "3️⃣  Criando áreas de interesse padrão..." -ForegroundColor Yellow
npm run seed:job-positions

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aviso: Erro ao executar seed (pode ser que já existam áreas)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Áreas de interesse criadas" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Processo concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Reinicie o servidor backend (Ctrl+C e depois npm run server:dev)"
Write-Host "   2. Recarregue a página admin no navegador"


