# 🗑️ Remover TRAE SOLO Completamente

Se o badge ainda aparece mesmo após os passos anteriores, siga este guia completo:

## 🔍 Diagnóstico

Execute na VPS para verificar:

```bash
# Verificar se o build contém TRAE SOLO
grep -r "TRAE\|trae" /var/www/central-rnc/ 2>/dev/null

# Verificar vite.config.ts
cat ~/app/vite.config.ts | grep -i trae

# Verificar package.json
cat ~/app/package.json | grep -i trae
```

## ✅ Solução Completa

### Opção 1: Usar Script Automatizado (Recomendado)

1. **Enviar script para VPS:**

```powershell
# Do seu computador
scp remover-trae-solo-completo.sh root@72.60.155.69:/root/app/
```

2. **Executar na VPS:**

```bash
cd ~/app
chmod +x remover-trae-solo-completo.sh
bash remover-trae-solo-completo.sh
```

### Opção 2: Passos Manuais

Execute na VPS:

```bash
cd ~/app

# 1. Verificar e corrigir vite.config.ts
nano vite.config.ts
# Remova qualquer linha com "traeBadgePlugin" ou "trae-solo-badge"
# Salve: Ctrl+O, Enter, Ctrl+X

# 2. Remover dependência
npm uninstall vite-plugin-trae-solo-badge

# 3. Limpar TUDO
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite
rm -rf node_modules/vite-plugin-trae-solo-badge

# 4. Reinstalar dependências
npm install

# 5. Verificar se ainda tem referências
grep -r "trae" vite.config.ts package.json 2>/dev/null

# 6. Fazer build limpo
npm run build

# 7. Verificar se o build está limpo
grep -r "TRAE\|trae" dist/ 2>/dev/null
# Se retornar algo, há problema. Se não retornar nada, está OK.

# 8. Atualizar arquivos web
sudo rm -rf /var/www/central-rnc/*
sudo cp -r /root/app/dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

# 9. Limpar cache do Nginx
sudo systemctl reload nginx

# 10. Verificar no servidor
curl http://central-rnc.com.br | grep -i "trae"
# Se não retornar nada, está limpo!
```

## 🌐 Limpar Cache do Navegador

**IMPORTANTE:** Mesmo após remover do servidor, o navegador pode estar mostrando versão em cache:

1. **Chrome/Edge:**
   - `Ctrl + Shift + Delete`
   - Marque "Imagens e arquivos em cache"
   - Clique em "Limpar dados"

2. **Ou use modo anônimo/privado:**
   - `Ctrl + Shift + N` (Chrome)
   - `Ctrl + Shift + P` (Firefox)
   - Acesse: `http://central-rnc.com.br`

3. **Ou force reload:**
   - `Ctrl + F5` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

## 🧪 Verificar se Funcionou

```bash
# Na VPS - verificar arquivos servidos
curl http://central-rnc.com.br | grep -i "trae"

# Se não retornar nada, está limpo!
# Se ainda retornar, o problema pode ser:
# 1. Cache do navegador (limpe o cache)
# 2. CDN/proxy intermediário (aguarde alguns minutos)
```

## 🔄 Se Ainda Aparecer

Se mesmo após tudo isso ainda aparecer:

1. **Verificar se há múltiplos builds:**
   ```bash
   find /var/www -name "*.js" -exec grep -l "trae" {} \;
   ```

2. **Verificar se o Nginx está servindo do lugar certo:**
   ```bash
   sudo cat /etc/nginx/sites-available/central-rnc | grep root
   # Deve mostrar: root /var/www/central-rnc;
   ```

3. **Verificar permissões:**
   ```bash
   ls -la /var/www/central-rnc/
   # Deve pertencer a www-data
   ```

---

**💡 Dica:** O plugin pode injetar código em runtime. Se ainda aparecer após todos os passos, pode ser necessário verificar se há algum script sendo carregado dinamicamente.


