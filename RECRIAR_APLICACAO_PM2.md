# 🔄 Como Recriar a Aplicação "site" via PM2

Este guia mostra como parar, remover e recriar a aplicação "site" no PM2.

---

## 📋 PASSO 1: Conectar via SSH

```bash
ssh central-rnc@ftp.central-rnc.com.br
```

---

## 🛑 PASSO 2: Parar e Remover a Aplicação Atual

```bash
# Mudar para o diretório da aplicação
cd ~/apps_nodejs

# Verificar aplicações PM2 rodando
pm2 list

# Parar a aplicação "site" (se estiver rodando)
pm2 stop site

# Remover a aplicação "site" do PM2
pm2 delete site

# Verificar se foi removida
pm2 list
```

**✅ Resultado esperado:** A aplicação "site" não deve mais aparecer na lista.

---

## 🔧 PASSO 3: Verificar e Preparar o Ambiente

```bash
# Selecionar versão do Node.js
nvm use 22.1.0

# Verificar versão
node --version
# Deve mostrar: v22.1.0

# Verificar se o start.sh existe e tem permissão de execução
ls -la start.sh
chmod +x start.sh

# Verificar se o diretório está correto
pwd
# Deve mostrar: /home/central-rnc/apps_nodejs
```

---

## 🚀 PASSO 4: Criar Nova Aplicação no PM2

### Opção 1: Usando o script start.sh (Recomendado)

```bash
# Criar aplicação usando o start.sh
pm2 start start.sh --name site

# OU, se o painel da KingHost estiver configurado para usar start.sh,
# você pode simplesmente iniciar via painel
```

### Opção 2: Usando tsx diretamente

```bash
# Criar aplicação executando tsx diretamente
cd ~/apps_nodejs
pm2 start npx --name site -- tsx api/server.ts
```

### Opção 3: Usando ecosystem.config.js (se existir)

```bash
# Se você tiver um arquivo ecosystem.config.js
pm2 start ecosystem.config.js
```

---

## 💾 PASSO 5: Salvar Configuração do PM2

```bash
# Salvar a lista atual de aplicações
pm2 save

# Configurar PM2 para iniciar automaticamente no boot (opcional)
pm2 startup
# Siga as instruções que aparecerem
```

---

## ✅ PASSO 6: Verificar se Está Funcionando

```bash
# Verificar status
pm2 list

# Deve mostrar:
# ┌────┬─────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
# │ id │ name    │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │
# ├────┼─────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
# │ 0  │ site    │ default     │ 0.0.0   │ fork    │ 12345    │ 0s     │ 0    │ online    │
# └────┴─────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘

# Ver informações detalhadas
pm2 info site

# Ver logs em tempo real
pm2 logs site

# Ver logs das últimas 50 linhas
pm2 logs site --lines 50
```

---

## 🔍 PASSO 7: Verificar Logs e Erros

```bash
# Ver logs de saída (stdout)
tail -f ~/.pm2/logs/site-out.log

# Ver logs de erro (stderr)
tail -f ~/.pm2/logs/site-error.log

# Ver ambos os logs
pm2 logs site --lines 100
```

**✅ Procure por:**
- ✅ `Server ready on port XXXX` - Aplicação iniciou corretamente
- ✅ `EmailService inicializado` - Serviços carregados
- ❌ `Error` ou `Cannot find module` - Problemas que precisam ser corrigidos

---

## 🔄 Comandos Úteis do PM2

```bash
# Reiniciar aplicação
pm2 restart site

# Parar aplicação
pm2 stop site

# Iniciar aplicação
pm2 start site

# Recarregar aplicação (zero downtime)
pm2 reload site

# Ver monitoramento em tempo real
pm2 monit

# Ver estatísticas
pm2 status

# Limpar logs antigos
pm2 flush

# Ver informações detalhadas
pm2 describe site
```

---

## ⚠️ TROUBLESHOOTING

### Erro: "EADDRINUSE: address already in use :::3006"

**Causa:** A porta 3006 já está sendo usada por outro processo.

**Solução:**

```bash
# 1. Parar todas as aplicações PM2
pm2 stop all
pm2 delete all

# 2. Verificar processos usando a porta 3006
lsof -i:3006
# OU
netstat -tulpn | grep :3006

# 3. Se encontrar processos, matar (substitua PID pelo número do processo)
kill -9 PID

# 4. Verificar variáveis de porta da KingHost
env | grep PORT

# 5. Recriar aplicação
pm2 start start.sh --name site
pm2 logs site
```

**⚠️ IMPORTANTE:** A KingHost fornece a porta automaticamente via `PORT_START` ou `PORT_SITE`. 
O código não deve usar a porta 3006 na produção. Verifique qual variável está disponível:

```bash
# No servidor, execute:
env | grep PORT
```

Se nenhuma variável `PORT_*` estiver disponível, verifique no painel da KingHost qual porta foi atribuída.

### Erro: "site doesn't exist"
- A aplicação não foi criada ainda
- Execute: `pm2 start start.sh --name site`

### Erro: "Cannot find module"
- Dependências não instaladas
- Execute: `cd ~/apps_nodejs && npm install`

### Erro: "tsx not found"
- tsx não está instalado
- Execute: `npm install tsx --save-dev`

### Aplicação não inicia
- Verifique os logs: `pm2 logs site`
- Verifique se o Node.js está correto: `node --version`
- Verifique se o start.sh tem permissão: `chmod +x start.sh`

### Aplicação inicia mas para imediatamente
- Verifique os logs de erro: `pm2 logs site --err`
- Verifique se a porta está disponível
- Verifique se o .env está configurado corretamente

---

## 📝 Exemplo Completo (Copiar e Colar)

```bash
# 1. Conectar e ir para o diretório
cd ~/apps_nodejs

# 2. Selecionar Node.js
nvm use 22.1.0

# 3. Parar e remover aplicação antiga
pm2 stop site 2>/dev/null
pm2 delete site 2>/dev/null

# 4. Dar permissão ao start.sh
chmod +x start.sh

# 5. Criar nova aplicação
pm2 start start.sh --name site

# 6. Salvar configuração
pm2 save

# 7. Verificar status
pm2 list

# 8. Ver logs
pm2 logs site --lines 30
```

---

## 🎯 Configuração Recomendada no Painel KingHost

Após recriar via PM2, verifique no painel da KingHost:

1. **Nome da Aplicação:** `site` (minúsculo)
2. **Script:** `start.sh`
3. **Caminho da Aplicação:** `/`
4. **Acesso Web:** `SIM`
5. **Acesso direto à porta:** `SIM`
6. **Porta:** (será definida automaticamente)

**⚠️ IMPORTANTE:** O painel da KingHost pode sobrescrever as configurações do PM2. Se você recriar via PM2, o painel pode reiniciar a aplicação com suas próprias configurações.

---

## 💡 Dica: Sincronizar com Painel

Se você recriar via PM2, mas o painel da KingHost também gerencia a aplicação:

1. **Opção 1:** Use apenas o painel (recomendado)
   - Recrie a aplicação no painel
   - O painel gerencia o PM2 automaticamente

2. **Opção 2:** Use apenas PM2 via SSH
   - Recrie via PM2 (como mostrado acima)
   - Não use o painel para gerenciar

**⚠️ Não use ambos ao mesmo tempo** - pode causar conflitos!

---

## ✅ Checklist Final

- [ ] Aplicação antiga removida (`pm2 delete site`)
- [ ] Node.js 22.1.0 selecionado (`nvm use 22.1.0`)
- [ ] `start.sh` tem permissão de execução (`chmod +x start.sh`)
- [ ] Nova aplicação criada (`pm2 start start.sh --name site`)
- [ ] Configuração salva (`pm2 save`)
- [ ] Aplicação aparece como "online" (`pm2 list`)
- [ ] Logs não mostram erros (`pm2 logs site`)
- [ ] Site acessível via navegador

---

**🎉 Pronto!** A aplicação "site" foi recriada e deve estar funcionando!

