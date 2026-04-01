# 📦 Lista de Arquivos para Deploy - KingHost

Esta é a lista completa de arquivos e pastas que você precisa enviar via FTP para `~/apps_nodejs/site/`

---

## ✅ PASTAS QUE DEVEM SER ENVIADAS:

### 1. **api/** (OBRIGATÓRIO)
   - Toda a pasta `api/` com todos os seus arquivos
   - Contém: controllers, routes, services, middleware, etc.

### 2. **prisma/** (OBRIGATÓRIO)
   - Toda a pasta `prisma/` com todos os seus arquivos
   - Contém: schema.prisma, migrations, seed.ts (opcional)

### 3. **public/** (OBRIGATÓRIO)
   - Toda a pasta `public/` com todos os seus arquivos
   - Contém: uploads/, favicon.svg, robots.txt, etc.

### 4. **dist/** (OBRIGATÓRIO)
   - Toda a pasta `dist/` (build do frontend)
   - Esta pasta é gerada quando você executa `npm run build`
   - **IMPORTANTE:** Execute `npm run build` localmente antes de fazer upload

---

## ✅ ARQUIVOS QUE DEVEM SER ENVIADOS:

### Arquivos de Configuração do Projeto:
1. **package.json** (OBRIGATÓRIO)
2. **package-lock.json** (OBRIGATÓRIO)
3. **main.js** (OBRIGATÓRIO - ponto de entrada da aplicação)
4. **tsconfig.json** (OBRIGATÓRIO)
5. **vite.config.ts** (OBRIGATÓRIO)
6. **tailwind.config.js** (OBRIGATÓRIO)
7. **postcss.config.js** (OBRIGATÓRIO)
8. **index.html** (OBRIGATÓRIO)

---

## ❌ O QUE NÃO DEVE SER ENVIADO:

### Pastas que NÃO devem ser enviadas:
- **node_modules/** ❌ (será instalado no servidor com `npm install`)
- **.git/** ❌ (controle de versão, não necessário em produção)
- **.vscode/** ❌ (configurações do editor)
- **dist/** se ainda não foi feito o build ❌

### Arquivos que NÃO devem ser enviados:
- **.env** ❌ (será criado no servidor com as variáveis de produção)
- **.env.local** ❌
- **.env.*.local** ❌
- ***.log** ❌ (arquivos de log)
- **.DS_Store** ❌ (macOS)
- **Thumbs.db** ❌ (Windows)
- **prisma/dev.db** ❌ (banco de desenvolvimento SQLite)

---

## 📋 CHECKLIST ANTES DO UPLOAD:

Antes de fazer upload, certifique-se de:

- [ ] Executar `npm run build` localmente para gerar a pasta `dist/`
- [ ] Verificar se a pasta `dist/` existe e contém os arquivos compilados
- [ ] Verificar se o arquivo `main.js` existe na raiz do projeto
- [ ] Não incluir `node_modules/` no upload
- [ ] Não incluir arquivos `.env` no upload

---

## 📤 ESTRUTURA FINAL NO SERVIDOR:

Após o upload, a estrutura em `~/apps_nodejs/site/` deve ser:

```
~/apps_nodejs/site/
├── api/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── app.ts
│   ├── server.ts
│   └── ...
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── ...
├── public/
│   ├── uploads/
│   ├── favicon.svg
│   └── ...
├── dist/
│   ├── index.html
│   ├── assets/
│   └── ...
├── package.json
├── package-lock.json
├── main.js
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

---

## 🚀 ORDEM RECOMENDADA DE UPLOAD:

1. **Primeiro:** Enviar arquivos de configuração (package.json, tsconfig.json, etc.)
2. **Segundo:** Enviar pastas principais (api/, prisma/, public/)
3. **Terceiro:** Enviar pasta dist/ (build do frontend)
4. **Por último:** Enviar main.js

---

## ⚠️ IMPORTANTE:

- **Tamanho:** Se você tiver muitos arquivos em `public/uploads/`, considere fazer upload apenas da estrutura (sem os arquivos de upload já existentes, se houver)
- **Permissões:** Após o upload, certifique-se de que a pasta `public/uploads/` tenha permissões de escrita (chmod 755)
- **Build:** Sempre faça o build do frontend (`npm run build`) antes de fazer upload da pasta `dist/`
- **Banco de Dados:** O projeto usa SQLite em desenvolvimento, mas MySQL em produção. Após o upload, você precisará:
  1. Editar `prisma/schema.prisma` e alterar o datasource para MySQL
  2. Criar arquivo `.env` com `DATABASE_URL` do MySQL
  3. Executar `npx prisma generate` e `npx prisma migrate deploy`

---

## 📝 RESUMO RÁPIDO:

**Enviar:**
- ✅ api/
- ✅ prisma/
- ✅ public/
- ✅ dist/
- ✅ package.json
- ✅ package-lock.json
- ✅ main.js
- ✅ tsconfig.json
- ✅ vite.config.ts
- ✅ tailwind.config.js
- ✅ postcss.config.js
- ✅ index.html

**NÃO enviar:**
- ❌ node_modules/
- ❌ .env
- ❌ .git/
- ❌ arquivos de log
- ❌ prisma/dev.db

