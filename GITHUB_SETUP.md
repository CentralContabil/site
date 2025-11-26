# 📦 Configuração do Repositório GitHub

## 🎯 Caminho do Repositório

O projeto estará disponível no GitHub no seguinte caminho:

```
https://github.com/seu-usuario/central-contabil.git
```

**⚠️ IMPORTANTE:** Substitua `seu-usuario` pelo seu nome de usuário do GitHub.

## 📋 Passos para Publicar no GitHub

### 1. Criar o Repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Clique em **"New repository"** (ou **"+"** → **"New repository"**)
3. Configure:
   - **Repository name:** `central-contabil` (ou o nome que preferir)
   - **Description:** "Sistema de gestão e website - Central Contábil"
   - **Visibility:** Escolha **Private** (recomendado) ou **Public**
   - **NÃO** marque "Initialize with README" (já temos um)
4. Clique em **"Create repository"**

### 2. Conectar o Repositório Local ao GitHub

Execute os seguintes comandos no terminal (na raiz do projeto):

```bash
# Adicionar o remote (substitua SEU-USUARIO pelo seu usuário)
git remote add origin https://github.com/SEU-USUARIO/central-contabil.git

# Verificar se foi adicionado corretamente
git remote -v
```

### 3. Preparar e Fazer o Commit Inicial

```bash
# Adicionar todos os arquivos
git add .

# Fazer o commit inicial
git commit -m "feat: versão inicial do sistema Central Contábil

- Sistema completo de gestão empresarial
- Painel administrativo
- Website institucional
- Blog com categorias e tags
- Internacionalização (PT-BR, EN, ES)
- Sistema de autenticação 2FA
- Logs de acesso
- Gerenciamento de conteúdo dinâmico"

# Enviar para o GitHub
git push -u origin master
```

**Nota:** Se você estiver usando `main` como branch padrão:

```bash
git push -u origin master:main
```

Ou renomeie a branch local:

```bash
git branch -M main
git push -u origin main
```

### 4. Verificar no GitHub

Acesse o repositório no GitHub e verifique se todos os arquivos foram enviados corretamente.

## 🔒 Segurança

### Arquivos que NÃO serão enviados (já estão no .gitignore):

- ✅ `.env` (variáveis de ambiente)
- ✅ `node_modules/` (dependências)
- ✅ `dist/` (build de produção)
- ✅ `prisma/dev.db` (banco de dados local)
- ✅ `public/uploads/*` (arquivos enviados pelos usuários)

### ⚠️ IMPORTANTE - Antes de fazer push:

1. **Nunca commite arquivos `.env`** com credenciais reais
2. **Use `.env.example`** como template
3. **Verifique se não há tokens ou senhas** nos arquivos commitados
4. **Revise o histórico** antes de fazer push público

## 📝 Estrutura do Repositório

O repositório conterá:

```
central-contabil/
├── api/                    # Backend
├── src/                    # Frontend
├── prisma/                 # Schema do banco
├── public/                 # Arquivos estáticos
├── scripts/                # Scripts de deploy
├── .gitignore             # Arquivos ignorados
├── .htaccess              # Configuração Apache
├── README.md              # Documentação principal
├── DEPLOY_KINGHOST.md     # Guia de deploy
├── CHECKLIST_DEPLOY.md    # Checklist
├── GITHUB_SETUP.md        # Este arquivo
├── package.json           # Dependências
└── ecosystem.config.js    # Config PM2
```

## 🚀 Próximos Passos Após Publicar

1. ✅ Configurar secrets no GitHub (se usar CI/CD)
2. ✅ Configurar branch protection (recomendado)
3. ✅ Adicionar colaboradores (se necessário)
4. ✅ Seguir para deploy em produção

## 📞 Suporte

Em caso de dúvidas sobre o GitHub:
- [Documentação do GitHub](https://docs.github.com)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
