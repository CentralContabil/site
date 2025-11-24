# Configuração do GitHub - Backup do Projeto

## ✅ Status Atual

O repositório Git local foi inicializado e o commit inicial foi criado com sucesso!

**Commit:** `e9ea1c8` - Initial commit: Site Central Contábil

## 📋 Próximos Passos para Conectar ao GitHub

### Opção 1: Criar um Novo Repositório no GitHub

1. **Acesse o GitHub:**
   - Vá para https://github.com/new
   - Ou acesse seu perfil e clique em "New repository"

2. **Crie o Repositório:**
   - **Nome:** `site-central-contabil` (ou outro nome de sua preferência)
   - **Descrição:** "Site institucional e área administrativa - Central Contábil"
   - **Visibilidade:** Escolha entre Público ou Privado
   - **NÃO marque** "Initialize with README" (já temos um)
   - Clique em "Create repository"

3. **Conecte o Repositório Local ao GitHub:**

   Execute os seguintes comandos no terminal (substitua `SEU_USUARIO` pelo seu usuário do GitHub):

   ```bash
   git remote add origin https://github.com/SEU_USUARIO/site-central-contabil.git
   git branch -M main
   git push -u origin main
   ```

### Opção 2: Usar um Repositório Existente

Se você já tem um repositório no GitHub:

```bash
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
git branch -M main
git push -u origin main
```

## 🔒 Arquivos que NÃO serão versionados (protegidos)

O arquivo `.gitignore` está configurado para **NÃO** versionar:

- ✅ Arquivos de ambiente (`.env`) - contém senhas e chaves secretas
- ✅ Banco de dados (`prisma/dev.db`) - dados locais
- ✅ `node_modules/` - dependências
- ✅ Arquivos de upload (`public/uploads/*`) - imagens enviadas pelos usuários
- ✅ Arquivos temporários e logs

**IMPORTANTE:** Antes de fazer push, certifique-se de que:
- O arquivo `.env` existe localmente mas **NÃO** está no Git
- Você tem um backup do banco de dados em produção (se aplicável)

## 📝 Comandos Úteis

### Verificar Status
```bash
git status
```

### Adicionar Alterações
```bash
git add .
git commit -m "Descrição das alterações"
```

### Enviar para o GitHub
```bash
git push
```

### Ver Histórico
```bash
git log --oneline
```

### Criar uma Nova Branch
```bash
git checkout -b nome-da-branch
```

## 🚨 Backup do Banco de Dados

**IMPORTANTE:** O banco de dados SQLite (`prisma/dev.db`) **NÃO** será versionado.

Para fazer backup do banco de dados:

1. **Cópia Manual:**
   - Copie o arquivo `prisma/dev.db` para um local seguro
   - Ou use um serviço de backup em nuvem

2. **Exportar Dados:**
   ```bash
   # Exportar schema e dados
   npx prisma db pull
   ```

3. **Migrações:**
   - As migrações do Prisma (`prisma/migrations/`) **SÃO** versionadas
   - Isso permite recriar a estrutura do banco em qualquer ambiente

## ✅ Checklist Antes do Push

- [ ] Arquivo `.env` existe localmente mas não está no Git
- [ ] Banco de dados local está funcionando
- [ ] Todas as alterações foram commitadas
- [ ] Repositório GitHub foi criado
- [ ] Remote foi configurado corretamente

## 🎯 Após o Push

Após fazer o push inicial, você terá:
- ✅ Todo o código versionado no GitHub
- ✅ Histórico de commits
- ✅ Backup completo do projeto
- ✅ Possibilidade de colaboração
- ✅ Deploy facilitado (Vercel, Netlify, etc.)

