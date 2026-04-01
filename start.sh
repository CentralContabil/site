#!/bin/bash

# Mudar para o diretório da aplicação
cd /home/central-rnc/apps_nodejs || exit 1

# Carregar NVM - tentar diferentes locais
if [ -s "/opt/nvm/nvm.sh" ]; then
  export NVM_DIR="/opt/nvm"
  source /opt/nvm/nvm.sh
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  source "$HOME/.nvm/nvm.sh"
fi

# Usar Node.js 22.1.0 (ou a versão disponível)
if command -v nvm &> /dev/null; then
  nvm use 22.1.0 2>/dev/null || nvm use 20 2>/dev/null || nvm use 18 2>/dev/null
fi

# Adicionar Node.js ao PATH se necessário
if [ -d "/opt/nvm/versions/node/v22.1.0/bin" ]; then
  export PATH="/opt/nvm/versions/node/v22.1.0/bin:$PATH"
elif [ -d "/opt/nvm/versions/node/v20.13.1/bin" ]; then
  export PATH="/opt/nvm/versions/node/v20.13.1/bin:$PATH"
elif [ -d "/opt/nvm/versions/node/v18.20.2/bin" ]; then
  export PATH="/opt/nvm/versions/node/v18.20.2/bin:$PATH"
fi

# Verificar se Node.js está disponível
if ! command -v node &> /dev/null; then
  echo "❌ Erro: Node.js não encontrado no PATH"
  echo "PATH atual: $PATH"
  exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
echo "✅ Node.js versão: $NODE_VERSION"
echo "✅ Diretório atual: $(pwd)"

# Verificar se tsx está disponível
if ! command -v npx &> /dev/null; then
  echo "❌ Erro: npx não encontrado"
  exit 1
fi

# Executar aplicação
echo "🚀 Iniciando aplicação com: npx tsx api/server.ts"
exec npx tsx api/server.ts
