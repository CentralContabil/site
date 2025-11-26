#!/bin/bash

# ============================================
# Script de Deploy para Kinghost
# ============================================

echo "🚀 Iniciando deploy para Kinghost..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# 1. Verificar variáveis de ambiente
echo -e "${YELLOW}📋 Verificando variáveis de ambiente...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando a partir do .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  IMPORTANTE: Configure as variáveis no arquivo .env antes de continuar!${NC}"
        read -p "Pressione Enter após configurar o .env..."
    else
        echo -e "${RED}❌ Arquivo .env.example não encontrado!${NC}"
        exit 1
    fi
fi

# 2. Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

# 3. Gerar Prisma Client
echo -e "${YELLOW}🔧 Gerando Prisma Client...${NC}"
npx prisma generate

# 4. Executar migrações
echo -e "${YELLOW}🗄️  Executando migrações do banco de dados...${NC}"
npx prisma migrate deploy

# 5. Build do frontend
echo -e "${YELLOW}🏗️  Fazendo build do frontend...${NC}"
npm run build:client

# 6. Build do backend
echo -e "${YELLOW}🏗️  Fazendo build do backend...${NC}"
npm run build:api

# 7. Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erro: Build do frontend falhou!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo -e "${GREEN}📤 Agora você pode fazer upload dos arquivos para o servidor Kinghost${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "1. Faça upload de todos os arquivos para o servidor"
echo "2. Configure as variáveis de ambiente no servidor"
echo "3. Execute 'npm install --production' no servidor"
echo "4. Execute 'npx prisma generate' no servidor"
echo "5. Execute 'npx prisma migrate deploy' no servidor"
echo "6. Inicie o servidor com 'npm start' ou configure PM2"

