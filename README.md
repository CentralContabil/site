# Site e Área Administrativa

Projeto completo com site institucional e área administrativa, desenvolvido com React + TypeScript + Vite (frontend) e Node.js + Express + Prisma (backend).

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Passo 1: Instalar Dependências

```bash
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# JWT Secret (obrigatório para autenticação)
JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# Configurações de Email (opcional - para funcionalidades de email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# Porta do servidor (opcional - padrão: 3006)
PORT=3006
```

**Nota:** O `JWT_SECRET` é obrigatório. Você pode gerar um valor aleatório seguro. As configurações de email são opcionais e só são necessárias se você for usar funcionalidades de envio de email.

### Passo 3: Gerar o Prisma Client

```bash
npx prisma generate
```

### Passo 4: Executar Migrações do Banco de Dados

```bash
npx prisma migrate dev
```

### Passo 5: Popular o Banco de Dados (Seed)

Execute o seed para criar dados iniciais (administradores, configurações, slides, serviços, etc.):

```bash
npm run seed
```

Isso criará:
- **2 administradores:**
  - Email: `sistema@central-rnc.com.br` / Senha: `admin123`
  - Email: `wagner.guerra@gmail.com` / Senha: `admin123`
- Configurações padrão da empresa
- Slides, serviços e depoimentos de exemplo

### Passo 6: Executar o Projeto

Para executar tanto o frontend quanto o backend simultaneamente:

```bash
npm run dev
```

Isso iniciará:
- **Frontend (Vite):** http://localhost:5173 (ou outra porta disponível)
- **Backend (API):** http://localhost:3006

### Executar Separadamente

Se preferir executar frontend e backend em terminais separados:

**Terminal 1 - Frontend:**
```bash
npm run client:dev
```

**Terminal 2 - Backend:**
```bash
npm run server:dev
```

## 🌐 Acessando o Projeto

### Site Público

Após iniciar o projeto, acesse no navegador:
- **URL:** http://localhost:5173

### Área Administrativa

Para acessar a área administrativa:
1. Acesse: http://localhost:5173/admin/login
2. Use uma das credenciais criadas no seed:
   - **Email:** `sistema@central-rnc.com.br`
   - **Senha:** `admin123`

   OU

   - **Email:** `wagner.guerra@gmail.com`
   - **Senha:** `admin123`

## 📁 Estrutura do Projeto

```
├── api/                    # Backend (Express + Prisma)
│   ├── controllers/        # Controladores da API
│   ├── routes/            # Rotas da API
│   ├── services/          # Serviços de negócio
│   ├── middleware/        # Middlewares (auth, error handling)
│   └── lib/               # Bibliotecas e configurações
├── src/                   # Frontend (React + TypeScript)
│   ├── pages/             # Páginas do site
│   │   ├── admin/         # Páginas da área administrativa
│   │   └── ...            # Páginas públicas
│   ├── components/        # Componentes React
│   ├── services/          # Serviços de API (cliente)
│   └── ...
├── prisma/                # Schema e migrações do banco de dados
│   ├── schema.prisma      # Schema do Prisma
│   ├── dev.db            # Banco de dados SQLite
│   └── seed.ts           # Script de seed
└── public/                # Arquivos estáticos
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Executa frontend e backend simultaneamente
- `npm run client:dev` - Executa apenas o frontend
- `npm run server:dev` - Executa apenas o backend
- `npm run build` - Compila o projeto para produção
- `npm run preview` - Visualiza a build de produção
- `npm run seed` - Popula o banco de dados com dados iniciais
- `npm run lint` - Executa o linter
- `npm run check` - Verifica tipos TypeScript

## 🔧 Tecnologias Utilizadas

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Zustand (gerenciamento de estado)

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite
- JWT (autenticação)
- Bcrypt (hash de senhas)

## 📝 Notas Importantes

- O banco de dados SQLite está localizado em `prisma/dev.db`
- As imagens enviadas são salvas em `public/uploads/`
- O frontend faz proxy das requisições `/api` para o backend automaticamente
- Certifique-se de que a porta 3006 esteja disponível para o backend

## 🐛 Solução de Problemas

### Erro: "JWT_SECRET is not defined"
- Certifique-se de criar o arquivo `.env` com a variável `JWT_SECRET`

### Erro: "Cannot find module '@prisma/client'"
- Execute: `npx prisma generate`

### Erro: "Database not found"
- Execute: `npx prisma migrate dev`

### Porta já em uso
- Altere a porta no arquivo `nodemon.json` (backend) ou `vite.config.ts` (frontend)
