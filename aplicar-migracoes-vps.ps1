# Script para aplicar migrações do Prisma na VPS
# Execute: .\aplicar-migracoes-vps.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Aplicando Migracoes do Banco na VPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar ferramentas disponíveis
$hasSshpass = Get-Command sshpass -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue
$hasSsh = Get-Command ssh -ErrorAction SilentlyContinue

if (-not $hasSsh) {
    Write-Host "ERRO: SSH nao encontrado!" -ForegroundColor Red
    exit 1
}

$scriptContent = @'
cd /root/app

echo "========================================"
echo "Aplicando Migracoes do Banco"
echo "========================================"
echo ""

# 1. Fazer backup do schema atual
echo "1. Fazendo backup do schema..."
cp prisma/schema.prisma prisma/schema.prisma.backup 2>/dev/null || true

# 2. Atualizar schema para PostgreSQL
echo ""
echo "2. Atualizando schema para PostgreSQL..."
if [ -f prisma/schema.production.prisma ]; then
    cp prisma/schema.production.prisma prisma/schema.prisma
    echo "   Schema de producao aplicado"
else
    echo "   AVISO: schema.production.prisma nao encontrado"
fi

# 3. Regenerar Prisma Client
echo ""
echo "3. Regenerando Prisma Client..."
rm -rf node_modules/.prisma
npx prisma generate

# 4. Aplicar migracoes
echo ""
echo "4. Aplicando migracoes do banco..."
echo "   (Isso pode levar alguns minutos...)"
npx prisma db push --accept-data-loss

# 5. Verificar tabelas criadas
echo ""
echo "5. Verificando tabelas criadas..."
if psql -qtAX -d "$DATABASE_URL" -c "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'forms');" | grep -q 't'; then
    echo "   ✅ Tabela 'forms' existe"
else
    echo "   ❌ Tabela 'forms' nao encontrada"
fi

if psql -qtAX -d "$DATABASE_URL" -c "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'landing_pages');" | grep -q 't'; then
    echo "   ✅ Tabela 'landing_pages' existe"
else
    echo "   ❌ Tabela 'landing_pages' nao encontrada"
fi

if psql -qtAX -d "$DATABASE_URL" -c "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_fields');" | grep -q 't'; then
    echo "   ✅ Tabela 'form_fields' existe"
else
    echo "   ❌ Tabela 'form_fields' nao encontrada"
fi

if psql -qtAX -d "$DATABASE_URL" -c "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_submissions');" | grep -q 't'; then
    echo "   ✅ Tabela 'form_submissions' existe"
else
    echo "   ❌ Tabela 'form_submissions' nao encontrada"
fi

# 6. Reimportar dados (agora que as tabelas existem)
echo ""
echo "6. Reimportando dados..."
if [ -f "importar-dados-vps.js" ] && [ -d "dados_exportados" ]; then
    node importar-dados-vps.js
else
    echo "   AVISO: Script de importacao ou dados nao encontrados"
fi

# 7. Reiniciar aplicacao
echo ""
echo "7. Reiniciando aplicacao..."
pm2 restart central-rnc
pm2 save

echo ""
echo "========================================"
echo "Migracoes aplicadas!"
echo "========================================"
echo ""
pm2 status
'@

# Criar arquivo temporário
$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
[System.IO.File]::WriteAllText($tempScriptFile, $scriptContent, [System.Text.Encoding]::UTF8)

try {
    # Enviar script para VPS
    Write-Host "Enviando script para VPS..." -ForegroundColor Cyan
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/aplicar-migracoes.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/aplicar-migracoes.sh"
        cmd /c $pscpCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/aplicar-migracoes.sh"
    }
    
    # Executar script na VPS
    Write-Host "Aplicando migracoes na VPS..." -ForegroundColor Cyan
    Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e ssh "${VPS_USER}@${VPS_IP}" "chmod +x ${VPS_PATH}/aplicar-migracoes.sh && bash ${VPS_PATH}/aplicar-migracoes.sh"
    } elseif ($hasPlink) {
        $plinkCommand = "plink -ssh -pw `"$VPS_PASS`" -batch ${VPS_USER}@${VPS_IP} `"chmod +x ${VPS_PATH}/aplicar-migracoes.sh && bash ${VPS_PATH}/aplicar-migracoes.sh`""
        cmd /c $plinkCommand
    } else {
        Write-Host "   Senha: $VPS_PASS" -ForegroundColor Yellow
        & ssh "${VPS_USER}@${VPS_IP}" "chmod +x ${VPS_PATH}/aplicar-migracoes.sh && bash ${VPS_PATH}/aplicar-migracoes.sh"
    }
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Migracoes aplicadas!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


