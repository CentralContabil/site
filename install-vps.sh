#!/bin/bash

# Script de instalação automatizada para VPS Hostinger
# Execute: bash install-vps.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando instalação da aplicação na VPS Hostinger..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
    print_error "Não execute este script como root! Use seu usuário normal."
    exit 1
fi

# Obter nome do usuário
USER=$(whoami)
HOME_DIR=$HOME

print_info "Usuário: $USER"
print_info "Diretório home: $HOME_DIR"
echo ""

# ============================================
# 1. Atualizar sistema
# ============================================
print_info "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema atualizado"

# ============================================
# 2. Instalar dependências básicas
# ============================================
print_info "Instalando dependências básicas..."
sudo apt install -y curl wget git build-essential software-properties-common
print_success "Dependências instaladas"

# ============================================
# 3. Instalar NVM e Node.js
# ============================================
print_info "Instalando NVM..."
if [ -d "$HOME/.nvm" ]; then
    print_info "NVM já está instalado"
else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    print_success "NVM instalado"
fi

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Adicionar NVM ao .bashrc se não estiver
if ! grep -q "NVM_DIR" ~/.bashrc; then
    echo '' >> ~/.bashrc
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
fi

print_info "Instalando Node.js 22..."
nvm install 22
nvm use 22
nvm alias default 22
print_success "Node.js $(node --version) instalado"

# ============================================
# 4. Instalar PostgreSQL
# ============================================
print_info "Instalando PostgreSQL..."
if command -v psql &> /dev/null; then
    print_info "PostgreSQL já está instalado"
else
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL instalado"
fi

# ============================================
# 5. Criar banco de dados
# ============================================
print_info "Configurando banco de dados..."
read -p "Nome do banco de dados [central_rnc]: " DB_NAME
DB_NAME=${DB_NAME:-central_rnc}

read -p "Usuário do banco de dados [central_rnc_user]: " DB_USER
DB_USER=${DB_USER:-central_rnc_user}

read -sp "Senha do banco de dados: " DB_PASS
echo ""

# Criar banco e usuário
sudo -u postgres psql <<EOF
-- Criar banco de dados
SELECT 'CREATE DATABASE $DB_NAME' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Criar usuário
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
    END IF;
END
\$\$;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF

print_success "Banco de dados '$DB_NAME' criado"

# ============================================
# 6. Instalar PM2
# ============================================
print_info "Instalando PM2..."
if command -v pm2 &> /dev/null; then
    print_info "PM2 já está instalado"
else
    npm install -g pm2
    print_success "PM2 instalado"
fi

# Configurar PM2 para iniciar no boot
print_info "Configurando PM2 para iniciar no boot..."
pm2 startup | grep -v "PM2" | bash || true
pm2 save || true

# ============================================
# 7. Instalar Nginx
# ============================================
print_info "Instalando Nginx..."
if command -v nginx &> /dev/null; then
    print_info "Nginx já está instalado"
else
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx instalado"
fi

# ============================================
# 8. Criar estrutura de diretórios
# ============================================
print_info "Criando estrutura de diretórios..."
mkdir -p ~/app
mkdir -p ~/logs
mkdir -p ~/backups
mkdir -p ~/app/public/uploads
chmod -R 755 ~/app
chmod -R 755 ~/logs
chmod -R 755 ~/backups
chmod -R 755 ~/app/public/uploads
print_success "Diretórios criados"

# ============================================
# 9. Criar arquivo .env de exemplo
# ============================================
print_info "Criando arquivo .env de exemplo..."
if [ ! -f ~/app/.env ]; then
    # Gerar JWT_SECRET
    JWT_SECRET=$(openssl rand -base64 32)
    
    cat > ~/app/.env <<EOF
# Ambiente
NODE_ENV=production

# Porta do servidor
PORT=3006

# JWT Secret
JWT_SECRET=$JWT_SECRET

# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?schema=public"

# Email (SMTP) - CONFIGURE ESTES VALORES
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# URL da aplicação
APP_URL=https://central-rnc.com.br
EOF
    print_success "Arquivo .env criado em ~/app/.env"
    print_info "⚠️  IMPORTANTE: Edite ~/app/.env e configure SMTP e APP_URL"
else
    print_info "Arquivo .env já existe"
fi

# ============================================
# 10. Criar script de backup
# ============================================
print_info "Criando script de backup..."
cat > ~/backups/backup-db.sh <<'BACKUP_SCRIPT'
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/central_rnc_$DATE.sql"

# Carregar variáveis do .env
source ~/app/.env
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_FILE 2>/dev/null
if [ $? -eq 0 ]; then
    gzip $BACKUP_FILE
    # Manter apenas últimos 7 dias
    find $BACKUP_DIR -name "central_rnc_*.sql.gz" -mtime +7 -delete
    echo "✅ Backup criado: $BACKUP_FILE.gz"
else
    echo "❌ Erro ao criar backup"
    rm -f $BACKUP_FILE
fi
BACKUP_SCRIPT

chmod +x ~/backups/backup-db.sh
print_success "Script de backup criado"

# ============================================
# Resumo
# ============================================
echo ""
echo "=========================================="
print_success "Instalação concluída!"
echo "=========================================="
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Faça upload dos arquivos da aplicação para ~/app/"
echo "   - api/"
echo "   - prisma/"
echo "   - public/"
echo "   - package.json"
echo "   - etc..."
echo ""
echo "2. Edite o arquivo ~/app/.env e configure:"
echo "   - SMTP_HOST, SMTP_USER, SMTP_PASS"
echo "   - APP_URL (seu domínio)"
echo ""
echo "3. Instale as dependências:"
echo "   cd ~/app && npm install --production"
echo ""
echo "4. Configure o schema Prisma para PostgreSQL:"
echo "   Edite prisma/schema.prisma e mude provider para 'postgresql'"
echo ""
echo "5. Execute as migrações:"
echo "   cd ~/app && npx prisma generate && npx prisma migrate deploy"
echo ""
echo "6. Faça o build do frontend:"
echo "   cd ~/app && npm run build"
echo ""
echo "7. Configure o Nginx (veja DEPLOY_VPS_HOSTINGER.md)"
echo ""
echo "8. Inicie a aplicação:"
echo "   cd ~/app && pm2 start ecosystem.config.js"
echo ""
echo "📚 Veja o guia completo em: DEPLOY_VPS_HOSTINGER.md"
echo ""

