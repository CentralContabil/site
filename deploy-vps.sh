#!/bin/bash

# Script de deploy automatizado para VPS
# Execute: bash deploy-vps.sh

set -e

echo "🚀 Iniciando deploy da aplicação..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto!"
    exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    print_error "Arquivo .env não encontrado!"
    print_info "Crie um arquivo .env com as variáveis necessárias"
    exit 1
fi

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado! Execute install-vps.sh primeiro"
    exit 1
fi

print_info "Node.js: $(node --version)"
print_info "NPM: $(npm --version)"
echo ""

# 1. Instalar dependências
print_info "Instalando dependências..."
npm install --production
print_success "Dependências instaladas"

# 2. Verificar schema Prisma
print_info "Verificando schema Prisma..."
if grep -q "provider = \"sqlite\"" prisma/schema.prisma; then
    print_info "Schema está usando SQLite. Para produção, use PostgreSQL!"
    print_info "Copie prisma/schema.production.prisma para prisma/schema.prisma"
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# 3. Gerar Prisma Client
print_info "Gerando Prisma Client..."
npx prisma generate
print_success "Prisma Client gerado"

# 4. Executar migrações
print_info "Executando migrações do banco de dados..."
npx prisma migrate deploy
print_success "Migrações executadas"

# 5. Build do frontend
print_info "Fazendo build do frontend..."
npm run build
print_success "Build do frontend concluído"

# 6. Verificar se dist/ foi criado
if [ ! -d "dist" ]; then
    print_error "Pasta dist/ não foi criada!"
    exit 1
fi

# 7. Parar PM2 se estiver rodando
print_info "Parando aplicação PM2 (se estiver rodando)..."
pm2 stop central-rnc 2>/dev/null || true
pm2 delete central-rnc 2>/dev/null || true

# 8. Iniciar com PM2
print_info "Iniciando aplicação com PM2..."
cd ~/app
pm2 start ecosystem.vps.config.js || pm2 start ecosystem.config.js
pm2 save
print_success "Aplicação iniciada"

# 9. Verificar status
echo ""
print_info "Status da aplicação:"
pm2 status

echo ""
print_success "Deploy concluído!"
echo ""
print_info "Próximos passos:"
echo "  1. Verifique os logs: pm2 logs central-rnc"
echo "  2. Teste a API: curl http://localhost:3006/api/health"
echo "  3. Configure o Nginx (veja nginx-central-rnc.conf)"
echo "  4. Configure SSL com Certbot: sudo certbot --nginx -d seu-dominio.com.br"
echo ""


