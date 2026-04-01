# Script para verificar arquivos específicos que estão faltando
# Execute: .\verificar-arquivos-faltando.ps1

$VPS_IP = "72.60.155.69"
$VPS_USER = "root"
$VPS_PASS = "SUA_SENHA_VPS_AQUI"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificando Arquivos Faltando" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Arquivos que estão dando 404 no console
$arquivosFaltando = @(
    "fbe4c3ec-23be-4564-91e3-2881c3bfbbf4.jpg",
    "a043bcd0-4de2-46bf-be42-a4750a252a36.png",
    "62c2ccd7-5811-48c0-a081-559cfa9799fa.png",
    "3ab0328e-59c1-4b5d-b1d3-a6ed88853c93.jpg",
    "a36ae5a0-9083-4d51-800c-c3ac64be44a2.jpg",
    "58a7804f-49ef-4e40-8f3a-8e5f1cd2336b.jpg",
    "39b90ce0-444c-4011-92a2-5ebdf389205a.jpg"
)

# Verificar ferramentas
$hasSshpass = Get-Command sshpass -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue
$hasSsh = Get-Command ssh -ErrorAction SilentlyContinue

function Invoke-SSHCommand {
    param([string]$Command)
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e ssh "${VPS_USER}@${VPS_IP}" $Command
    } elseif ($hasPlink) {
        $plinkCommand = "plink -ssh -pw `"$VPS_PASS`" -batch ${VPS_USER}@${VPS_IP} `"$Command`""
        cmd /c $plinkCommand
    } else {
        & ssh "${VPS_USER}@${VPS_IP}" $Command
    }
}

$checkScript = @'
echo "Verificando arquivos faltando..."
echo ""

ARQUIVOS=(
    "fbe4c3ec-23be-4564-91e3-2881c3bfbbf4.jpg"
    "a043bcd0-4de2-46bf-be42-a4750a252a36.png"
    "62c2ccd7-5811-48c0-a081-559cfa9799fa.png"
    "3ab0328e-59c1-4b5d-b1d3-a6ed88853c93.jpg"
    "a36ae5a0-9083-4d51-800c-c3ac64be44a2.jpg"
    "58a7804f-49ef-4e40-8f3a-8e5f1cd2336b.jpg"
    "39b90ce0-444c-4011-92a2-5ebdf389205a.jpg"
)

FALTANDO=0
ENCONTRADOS=0

for ARQUIVO in "${ARQUIVOS[@]}"; do
    if [ -f "/var/www/central-rnc/uploads/$ARQUIVO" ]; then
        echo "   OK: $ARQUIVO"
        ENCONTRADOS=$((ENCONTRADOS + 1))
    elif [ -f "/root/app/public/uploads/$ARQUIVO" ]; then
        echo "   AVISO: $ARQUIVO existe em /root/app/public/uploads mas nao em /var/www/central-rnc/uploads"
        echo "   Copiando..."
        sudo cp "/root/app/public/uploads/$ARQUIVO" "/var/www/central-rnc/uploads/$ARQUIVO"
        sudo chown www-data:www-data "/var/www/central-rnc/uploads/$ARQUIVO"
        sudo chmod 755 "/var/www/central-rnc/uploads/$ARQUIVO"
        echo "   OK: Copiado"
        ENCONTRADOS=$((ENCONTRADOS + 1))
    else
        echo "   ERRO: $ARQUIVO NAO encontrado!"
        FALTANDO=$((FALTANDO + 1))
    fi
done

echo ""
echo "Resumo:"
echo "   Encontrados: $ENCONTRADOS"
echo "   Faltando: $FALTANDO"

if [ "$FALTANDO" -gt 0 ]; then
    echo ""
    echo "AVISO: Alguns arquivos estao faltando!"
    echo "Verifique se eles existem localmente em public/uploads/"
fi

echo ""
echo "Verificando se arquivos locais existem..."
if [ -d "/root/app/public/uploads" ]; then
    TOTAL_LOCAL=$(find /root/app/public/uploads -type f | wc -l)
    echo "   Total de arquivos em /root/app/public/uploads: $TOTAL_LOCAL"
fi

if [ -d "/var/www/central-rnc/uploads" ]; then
    TOTAL_NGINX=$(find /var/www/central-rnc/uploads -type f | wc -l)
    echo "   Total de arquivos em /var/www/central-rnc/uploads: $TOTAL_NGINX"
fi

echo ""
echo "Sincronizando todos os arquivos de /root/app/public/uploads para /var/www/central-rnc/uploads..."
if [ -d "/root/app/public/uploads" ] && [ "$(ls -A /root/app/public/uploads 2>/dev/null)" ]; then
    sudo cp -r /root/app/public/uploads/* /var/www/central-rnc/uploads/ 2>/dev/null || true
    sudo chown -R www-data:www-data /var/www/central-rnc/uploads
    sudo chmod -R 755 /var/www/central-rnc/uploads
    echo "   Sincronizacao concluida"
    
    TOTAL_NGINX_APOS=$(find /var/www/central-rnc/uploads -type f | wc -l)
    echo "   Total de arquivos apos sincronizacao: $TOTAL_NGINX_APOS"
else
    echo "   AVISO: Nenhum arquivo encontrado em /root/app/public/uploads"
fi

echo ""
echo "========================================"
echo "Verificacao concluida!"
echo "========================================"
'@

$tempScriptFile = [System.IO.Path]::GetTempFileName() + ".sh"
$checkScriptUnix = $checkScript -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText($tempScriptFile, $checkScriptUnix, [System.Text.UTF8Encoding]::new($false))

try {
    Write-Host "Verificando arquivos..." -ForegroundColor Cyan
    Write-Host ""
    
    if ($hasSshpass) {
        $env:SSHPASS = $VPS_PASS
        sshpass -e scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-files.sh"
    } elseif ($hasPlink) {
        $pscpCommand = "pscp -pw `"$VPS_PASS`" `"$tempScriptFile`" ${VPS_USER}@${VPS_IP}:/tmp/check-files.sh"
        cmd /c $pscpCommand
    } else {
        & scp "$tempScriptFile" "${VPS_USER}@${VPS_IP}:/tmp/check-files.sh"
    }
    
    Invoke-SSHCommand -Command "chmod +x /tmp/check-files.sh && bash /tmp/check-files.sh"
} finally {
    Remove-Item $tempScriptFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Verificacao Concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


