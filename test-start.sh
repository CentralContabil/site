#!/bin/bash
# Script de teste para verificar o ambiente antes de executar start.sh

echo "🔍 DIAGNÓSTICO DO AMBIENTE"
echo "=========================="
echo ""

# Verificar diretório atual
echo "📁 Diretório atual:"
pwd
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
  echo "⚠️  AVISO: package.json não encontrado no diretório atual"
  echo "   Tentando mudar para ~/apps_nodejs..."
  cd ~/apps_nodejs 2>/dev/null || cd /home/central-rnc/apps_nodejs 2>/dev/null
  pwd
fi
echo ""

# Verificar NVM
echo "🔧 Verificando NVM:"
if [ -s "/opt/nvm/nvm.sh" ]; then
  echo "   ✅ NVM encontrado em: /opt/nvm/nvm.sh"
  export NVM_DIR="/opt/nvm"
  source /opt/nvm/nvm.sh
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  echo "   ✅ NVM encontrado em: $HOME/.nvm/nvm.sh"
  export NVM_DIR="$HOME/.nvm"
  source "$HOME/.nvm/nvm.sh"
else
  echo "   ❌ NVM não encontrado"
fi
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js:"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  NODE_PATH=$(which node)
  echo "   ✅ Node.js encontrado: $NODE_VERSION"
  echo "   📍 Caminho: $NODE_PATH"
else
  echo "   ❌ Node.js não encontrado no PATH"
  echo "   PATH atual: $PATH"
fi
echo ""

# Verificar npm
echo "📦 Verificando npm:"
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  echo "   ✅ npm encontrado: $NPM_VERSION"
else
  echo "   ❌ npm não encontrado"
fi
echo ""

# Verificar npx
echo "📦 Verificando npx:"
if command -v npx &> /dev/null; then
  echo "   ✅ npx encontrado"
else
  echo "   ❌ npx não encontrado"
fi
echo ""

# Verificar tsx
echo "📦 Verificando tsx:"
if command -v tsx &> /dev/null; then
  TSX_VERSION=$(tsx --version 2>/dev/null || echo "instalado")
  echo "   ✅ tsx encontrado: $TSX_VERSION"
else
  echo "   ⚠️  tsx não encontrado globalmente"
  if [ -f "node_modules/.bin/tsx" ]; then
    echo "   ✅ tsx encontrado em node_modules/.bin/tsx"
  else
    echo "   ❌ tsx não encontrado (precisa instalar: npm install tsx)"
  fi
fi
echo ""

# Verificar arquivos importantes
echo "📄 Verificando arquivos importantes:"
if [ -f "api/server.ts" ]; then
  echo "   ✅ api/server.ts encontrado"
else
  echo "   ❌ api/server.ts NÃO encontrado"
fi

if [ -f "package.json" ]; then
  echo "   ✅ package.json encontrado"
else
  echo "   ❌ package.json NÃO encontrado"
fi

if [ -f ".env" ]; then
  echo "   ✅ .env encontrado"
else
  echo "   ⚠️  .env NÃO encontrado (pode ser necessário criar)"
fi

if [ -d "node_modules" ]; then
  echo "   ✅ node_modules encontrado"
  MODULES_COUNT=$(ls -1 node_modules 2>/dev/null | wc -l)
  echo "   📊 Número de módulos: $MODULES_COUNT"
else
  echo "   ❌ node_modules NÃO encontrado (execute: npm install)"
fi
echo ""

# Verificar variáveis de ambiente da KingHost
echo "🌐 Verificando variáveis de ambiente da KingHost:"
if [ -n "$PORT_START" ]; then
  echo "   ✅ PORT_START: $PORT_START"
else
  echo "   ⚠️  PORT_START não definido"
fi

if [ -n "$PORT_SITE" ]; then
  echo "   ✅ PORT_SITE: $PORT_SITE"
else
  echo "   ⚠️  PORT_SITE não definido"
fi

if [ -n "$PORT" ]; then
  echo "   ✅ PORT: $PORT"
else
  echo "   ⚠️  PORT não definido"
fi

# Listar todas as variáveis PORT_*
echo "   📋 Todas as variáveis PORT_*:"
env | grep "^PORT_" || echo "   (nenhuma encontrada)"
echo ""

# Teste final: tentar executar tsx
echo "🧪 Teste final - tentando executar tsx:"
if command -v npx &> /dev/null; then
  echo "   Executando: npx tsx --version"
  npx tsx --version 2>&1 | head -1 || echo "   ❌ Falha ao executar npx tsx"
else
  echo "   ❌ npx não disponível para teste"
fi
echo ""

echo "✅ Diagnóstico concluído!"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "   1. Se tudo estiver ✅, execute: ./start.sh"
echo "   2. Se houver ❌, corrija os problemas antes de executar"
echo "   3. Para ver logs em tempo real: pm2 logs site"



