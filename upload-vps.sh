#!/bin/bash

# Script Bash para upload de arquivos para VPS
# IP: 72.60.155.69
# Usuário: root
# Senha: SUA_SENHA_VPS_AQUI

VPS_IP="72.60.155.69"
VPS_USER="root"
VPS_PASS="SUA_SENHA_VPS_AQUI"
VPS_PATH="/root/app"

echo "🚀 Iniciando upload para VPS..."
echo "IP: $VPS_IP"
echo ""

# Verificar se sshpass está instalado
if ! command -v sshpass &> /dev/null; then
    echo "📦 Instalando sshpass..."
    sudo apt-get update
    sudo apt-get install -y sshpass
fi

# Função para upload
upload_file() {
    local item=$1
    if [ -e "$item" ]; then
        echo "   📤 Enviando: $item"
        if [ -d "$item" ]; then
            sshpass -p "$VPS_PASS" scp -r "$item" "$VPS_USER@$VPS_IP:$VPS_PATH/"
        else
            sshpass -p "$VPS_PASS" scp "$item" "$VPS_USER@$VPS_IP:$VPS_PATH/"
        fi
        echo "   ✅ $item enviado"
    else
        echo "   ⚠️  $item não encontrado"
    fi
}

# Lista de arquivos/pastas para enviar
ITEMS=(
    "./api"
    "./src"
    "./prisma"
    "./public"
    "./package.json"
    "./package-lock.json"
    "./tsconfig.json"
    "./vite.config.ts"
    "./tailwind.config.js"
    "./postcss.config.js"
    "./index.html"
)

echo "📤 Enviando arquivos..."
for item in "${ITEMS[@]}"; do
    upload_file "$item"
done

echo ""
echo "✅ Upload concluído!"
echo ""
echo "📋 Próximos passos na VPS:"
echo "   1. cd ~/app"
echo "   2. npm install"
echo "   3. npm run build"
echo "   4. pm2 start ecosystem.vps.config.js"


