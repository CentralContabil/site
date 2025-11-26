# Central Contábil - Sistema de Gestão e Website

Sistema completo de gestão empresarial com painel administrativo e website institucional.

## 🚀 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **i18next** para internacionalização (PT-BR, EN, ES)
- **Recharts** para gráficos
- **Lucide React** para ícones

### Backend
- **Node.js** com Express
- **Prisma ORM** com SQLite
- **JWT** para autenticação
- **Nodemailer** para envio de emails
- **Multer** para upload de arquivos
- **Zod** para validação

## 📋 Funcionalidades

### Website Público
- ✅ Hero section dinâmico
- ✅ Seções personalizáveis (Sobre, Serviços, Depoimentos, etc.)
- ✅ Blog com categorias e tags
- ✅ Benefícios fiscais
- ✅ Formulário de contato
- ✅ Newsletter
- ✅ Internacionalização (PT-BR, EN, ES)
- ✅ SEO otimizado

### Painel Administrativo
- ✅ Dashboard com estatísticas e gráficos
- ✅ Gerenciamento de conteúdo (Hero, Seções, Blog)
- ✅ Gerenciamento de serviços e clientes
- ✅ Sistema de mensagens de contato
- ✅ Gerenciamento de usuários
- ✅ Logs de acesso
- ✅ Configurações gerais
- ✅ Página de login personalizável
- ✅ Autenticação 2FA por email

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/central-contabil.git
cd central-contabil
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="seu-jwt-secret-aqui"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"

# API
PORT=3006
NODE_ENV=development
```

4. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`
O backend estará disponível em `http://localhost:3006`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia frontend e backend em modo desenvolvimento
- `npm run build` - Build completo (frontend + backend)
- `npm run build:client` - Build apenas do frontend
- `npm run build:api` - Build apenas do backend
- `npm start` - Inicia servidor em produção
- `npm run prisma:studio` - Abre Prisma Studio para visualizar dados

## 🌐 Deploy

### Kinghost (Shared Hosting)

Consulte o arquivo `DEPLOY_KINGHOST.md` para instruções detalhadas de deploy na Kinghost.

### Checklist de Deploy

Consulte o arquivo `CHECKLIST_DEPLOY.md` para um checklist completo antes do deploy.

## 📁 Estrutura do Projeto

```
├── api/                    # Backend (Express + Prisma)
│   ├── controllers/       # Controllers da API
│   ├── routes/            # Rotas da API
│   ├── services/          # Serviços (email, upload, etc.)
│   ├── middleware/        # Middlewares (auth, error handling)
│   └── lib/              # Bibliotecas (Prisma client)
├── src/                   # Frontend (React)
│   ├── components/       # Componentes React
│   ├── pages/           # Páginas
│   ├── services/        # Serviços (API client)
│   ├── hooks/           # Custom hooks
│   ├── types/           # TypeScript types
│   └── i18n/           # Traduções
├── prisma/              # Schema do banco de dados
├── public/              # Arquivos estáticos
└── dist/               # Build de produção
```

## 🔐 Segurança

- Autenticação JWT
- 2FA por email
- Validação de dados com Zod
- Sanitização de inputs
- Proteção contra XSS
- Rate limiting (recomendado em produção)

## 📝 Licença

Este projeto é privado e proprietário.

## 👥 Desenvolvido por

Central Contábil - Soluções Empresariais

---

Para mais informações, consulte a documentação em `DEPLOY_KINGHOST.md` e `CHECKLIST_DEPLOY.md`.
