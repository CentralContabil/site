# Script para verificar sincronização entre localhost e VPS
# Execute: .\verificar-sincronizacao.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"
$VPS_PATH = "/root/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificando Sincronizacao" -ForegroundColor Yellow
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

Write-Host "1. Verificando arquivos locais..." -ForegroundColor Cyan
Write-Host ""

# Verificar arquivos locais
$localFiles = @(
    "src/pages/admin/LandingPagesAdmin.tsx",
    "src/pages/admin/FormsAdmin.tsx",
    "src/pages/admin/AdminLayout.tsx",
    "src/App.tsx",
    "src/components/LandingPageCatchAll.tsx",
    "src/components/admin/LandingPageModal.tsx",
    "src/components/admin/FormModal.tsx"
)

$allLocalFilesExist = $true
foreach ($file in $localFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "   OK: $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "   ERRO: $file nao encontrado!" -ForegroundColor Red
        $allLocalFilesExist = $false
    }
}

Write-Host ""
Write-Host "2. Verificando build local..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    $htmlFiles = Get-ChildItem -Path "dist" -Filter "*.html" -Recurse
    $jsFiles = Get-ChildItem -Path "dist" -Filter "*.js" -Recurse
    
    Write-Host "   Tamanho total: $([math]::Round($distSize, 2)) MB" -ForegroundColor Green
    Write-Host "   Arquivos HTML: $($htmlFiles.Count)" -ForegroundColor Green
    Write-Host "   Arquivos JS: $($jsFiles.Count)" -ForegroundColor Green
    
    # Verificar se o index.html existe
    if (Test-Path "dist/index.html") {
        Write-Host "   OK: dist/index.html existe" -ForegroundColor Green
        
        # Verificar se contém referências a landing-pages ou forms
        $indexContent = Get-Content "dist/index.html" -Raw
        if ($indexContent -match "landing-pages|forms|LandingPages|FormsAdmin") {
            Write-Host "   OK: index.html contem referencias a Landing Pages/Forms" -ForegroundColor Green
        } else {
            Write-Host "   AVISO: index.html pode nao conter referencias a Landing Pages/Forms" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ERRO: dist/index.html nao encontrado!" -ForegroundColor Red
    }
} else {
    Write-Host "   ERRO: Pasta dist nao existe! Execute 'npm run build' primeiro." -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Verificando arquivos na VPS..." -ForegroundColor Cyan
Write-Host ""

$remoteCheckScript = @'
cd /root/app

echo "Verificando arquivos de codigo fonte..."
if [ -f "src/pages/admin/LandingPagesAdmin.tsx" ]; then
    echo "   OK: LandingPagesAdmin.tsx existe"
    ls -lh src/pages/admin/LandingPagesAdmin.tsx | awk '{print "      Tamanho: " $5}'
else
    echo "   ERRO: LandingPagesAdmin.tsx nao encontrado!"
fi

if [ -f "src/pages/admin/FormsAdmin.tsx" ]; then
    echo "   OK: FormsAdmin.tsx existe"
    ls -lh src/pages/admin/FormsAdmin.tsx | awk '{print "      Tamanho: " $5}'
else
    echo "   ERRO: FormsAdmin.tsx nao encontrado!"
fi

echo ""
echo "Verificando build na VPS..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    HTML_COUNT=$(find dist -name "*.html" | wc -l)
    JS_COUNT=$(find dist -name "*.js" | wc -l)
    echo "   Tamanho total: $DIST_SIZE"
    echo "   Arquivos HTML: $HTML_COUNT"
    echo "   Arquivos JS: $JS_COUNT"
    
    if [ -f "dist/index.html" ]; then
        echo "   OK: dist/index.html existe"
        if grep -q "landing-pages\|forms\|LandingPages\|FormsAdmin" dist/index.html 2>/dev/null; then
            echo "   OK: index.html contem referencias a Landing Pages/Forms"
        else
            echo "   AVISO: index.html pode nao conter referencias"
        fi
    else
        echo "   ERRO: dist/index.html nao encontrado!"
    fi
else
    echo "   ERRO: Pasta dist nao existe!"
fi

echo ""
echo "Verificando frontend no Nginx..."
if [ -d "/var/www/central-rnc" ]; then
    NGINX_SIZE=$(du -sh /var/www/central-rnc | cut -f1)
    NGINX_HTML=$(find /var/www/central-rnc -name "*.html" | wc -l)
    NGINX_JS=$(find /var/www/central-rnc -name "*.js" | wc -l)
    echo "   Tamanho total: $NGINX_SIZE"
    echo "   Arquivos HTML: $NGINX_HTML"
    echo "   Arquivos JS: $NGINX_JS"
    
    if [ -f "/var/www/central-rnc/index.html" ]; then
        echo "   OK: /var/www/central-rnc/index.html existe"
        if grep -q "landing-pages\|forms\|LandingPages\|FormsAdmin" /var/www/central-rnc/index.html 2>/dev/null; then
            echo "   OK: index.html do Nginx contem referencias a Landing Pages/Forms"
        else
            echo "   AVISO: index.html do Nginx pode nao conter referencias"
        fi
    else
        echo "   ERRO: /var/www/central-rnc/index.html nao encontrado!"
    fi
else
    echo "   ERRO: /var/www/central-rnc nao existe!"
fi

echo ""
echo "Verificando rotas no App.tsx..."
if [ -f "src/App.tsx" ]; then
    if grep -q "landing-pages\|forms" src/App.tsx; then
        echo "   OK: App.tsx contem rotas para landing-pages e forms"
        grep -n "landing-pages\|forms" src/App.tsx | head -5
    else
        echo "   ERRO: App.tsx nao contem rotas para landing-pages/forms!"
    fi
else
    echo "   AVISO: src/App.tsx nao encontrado (pode ser normal se so dist foi enviado)"
fi

echo ""
echo "Verificando menu no AdminLayout.tsx..."
if [ -f "src/pages/admin/AdminLayout.tsx" ]; then
    if grep -q "Landing Pages\|Formularios" src/pages/admin/AdminLayout.tsx; then
        echo "   OK: AdminLayout.tsx contem itens de menu para Landing Pages/Forms"
        grep -n "Landing Pages\|Formularios" src/pages/admin/AdminLayout.tsx | head -3
    else
        echo "   ERRO: AdminLayout.tsx nao contem itens de menu!"
    fi
else
    echo "   AVISO: AdminLayout.tsx nao encontrado (pode ser normal se so dist foi enviado)"
fi
'@

# Criar arquivo temporário
$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
# Converter CRLF para LF (Unix line endings)
$remoteCheckScriptUnix = $remoteCheckScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $remoteCheckScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    # Enviar script para VPS
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/verificar-sync.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/verificar-sync.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/verificar-sync.sh"
    }
    
    # Executar script na VPS
    Invoke-SSHCommand -Command "chmod +x $VPS_PATH/verificar-sync.sh && bash $VPS_PATH/verificar-sync.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificacao concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

