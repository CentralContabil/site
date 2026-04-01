#!/bin/bash

# Script para enviar ecosystem.config.js para VPS
# Execute: bash enviar-ecosystem-vps.sh

VPS_IP="72.60.155.69"
VPS_USER="root"
VPS_PASSWORD="SUA_SENHA_VPS_AQUI"

echo "📤 Enviando ecosystem.config.js para VPS..."

# Copiar ecosystem.vps.config.js para ecosystem.config.js
cp ecosystem.vps.config.js ecosystem.config.js

# Enviar para VPS usando sshpass
if command -v sshpass &> /dev/null; then
    sshpass -p "$VPS_PASSWORD" scp ecosystem.config.js ${VPS_USER}@${VPS_IP}:/root/app/
else
    echo "⚠️  sshpass não encontrado. Instale com: sudo apt install sshpass"
    echo "   Ou use SCP manualmente:"
    echo "   scp ecosystem.config.js ${VPS_USER}@${VPS_IP}:/root/app/"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "✅ Arquivo enviado com sucesso!"
    echo ""
    echo "📋 Próximos passos na VPS:"
    echo "   cd ~/app"
    echo "   pm2 start ecosystem.config.js"
    echo "   pm2 save"
else
    echo "❌ Erro ao enviar arquivo"
    exit 1
fi


