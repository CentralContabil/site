# Script para verificar build local
# Execute: .\verificar-build-local.ps1

Write-Host "Verificando build local..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "dist")) {
    Write-Host "ERRO: Pasta dist nao existe! Execute 'npm run build' primeiro." -ForegroundColor Red
    exit 1
}

# Encontrar arquivo JS principal
$jsFile = Get-ChildItem -Path "dist/assets" -Filter "index-*.js" | Select-Object -First 1

if ($jsFile) {
    Write-Host "Arquivo JS encontrado: $($jsFile.Name)" -ForegroundColor Green
    Write-Host "Tamanho: $([math]::Round($jsFile.Length / 1MB, 2)) MB" -ForegroundColor Green
    Write-Host ""
    
    # Ler conteúdo (apenas uma parte para não carregar tudo na memória)
    Write-Host "Verificando conteudo..." -ForegroundColor Cyan
    $content = Get-Content $jsFile.FullName -Raw
    
    $checks = @(
        @{ Name = "LandingPagesAdmin"; Found = $content -match "LandingPagesAdmin" },
        @{ Name = "FormsAdmin"; Found = $content -match "FormsAdmin" },
        @{ Name = "landing-pages"; Found = $content -match "landing-pages" },
        @{ Name = "forms"; Found = $content -match '"/admin/forms"' },
        @{ Name = "LandingPageCatchAll"; Found = $content -match "LandingPageCatchAll" }
    )
    
    $allFound = $true
    foreach ($check in $checks) {
        if ($check.Found) {
            Write-Host "   OK: $($check.Name) encontrado" -ForegroundColor Green
        } else {
            Write-Host "   ERRO: $($check.Name) NAO encontrado!" -ForegroundColor Red
            $allFound = $false
        }
    }
    
    Write-Host ""
    if ($allFound) {
        Write-Host "Build local esta CORRETO!" -ForegroundColor Green
    } else {
        Write-Host "Build local esta INCOMPLETO! Execute 'npm run build' novamente." -ForegroundColor Red
    }
} else {
    Write-Host "ERRO: Arquivo JS nao encontrado em dist/assets/" -ForegroundColor Red
}


