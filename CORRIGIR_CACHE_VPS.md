# 🔄 Corrigir Cache na VPS - Blog Não Atualiza

## 🚨 Problema
Mesmo após enviar arquivos e rodar o script, a página do blog não atualiza na VPS.

## ✅ Solução Completa

### Passo 1: Enviar Arquivos Novamente

**No Windows:**
```powershell
# Certifique-se de que fez o build
npm run build

# Enviar arquivos
scp -r dist/* root@72.60.155.69:/root/app/dist/
# Senha: SUA_SENHA_VPS_AQUI
```

### Passo 2: Na VPS, Executar Script FORÇADO

**Conecte via SSH:**
```bash
ssh root@72.60.155.69
# Senha: SUA_SENHA_VPS_AQUI
```

**Envie o script:**
```powershell
scp atualizar-frontend-vps-forcado.sh root@72.60.155.69:/root/app/
```

**Execute:**
```bash
cd /root/app
chmod +x atualizar-frontend-vps-forcado.sh
bash atualizar-frontend-vps-forcado.sh
```

### Passo 3: Limpar Cache do Navegador

**No navegador:**
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Imagens e arquivos em cache"
3. Período: "Todo o período"
4. Clique em "Limpar dados"

**OU use modo anônimo:**
- Pressione `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Firefox)
- Acesse: https://central-rnc.com.br/blog

**OU force reload:**
- Pressione `Ctrl + F5` na página
- OU `Ctrl + Shift + R`

### Passo 4: Verificar se Atualizou

**Verificar arquivos na VPS:**
```bash
# Ver timestamp do arquivo JS
ls -lh /var/www/central-rnc/assets/*.js | head -1

# Ver conteúdo do index.html
head -20 /var/www/central-rnc/index.html
```

**Verificar no navegador:**
1. Abra DevTools (F12)
2. Vá na aba "Network"
3. Marque "Disable cache"
4. Recarregue a página (F5)
5. Verifique se os arquivos JS/CSS são os novos

## 🔍 Diagnóstico

### Verificar se os arquivos foram copiados:
```bash
# Contar arquivos
find /var/www/central-rnc -type f | wc -l

# Verificar index.html
cat /var/www/central-rnc/index.html | grep -i "blog"
```

### Verificar logs do Nginx:
```bash
sudo tail -f /var/log/nginx/central-rnc-access.log
sudo tail -f /var/log/nginx/central-rnc-error.log
```

### Verificar se Nginx está servindo os arquivos corretos:
```bash
# Testar localmente na VPS
curl -I http://localhost/assets/index-*.js | head -5
```

## 🐛 Se Ainda Não Funcionar

### 1. Verificar Configuração do Nginx
```bash
sudo nginx -t
sudo cat /etc/nginx/sites-available/central-rnc | grep -A 5 "location /"
```

### 2. Reiniciar Tudo
```bash
sudo systemctl restart nginx
pm2 restart central-rnc
```

### 3. Verificar Permissões
```bash
ls -la /var/www/central-rnc/
ls -la /var/www/central-rnc/assets/
```

### 4. Forçar Atualização com Versão na URL
Adicione um parâmetro de versão no `index.html`:
```bash
# Na VPS
sed -i 's|href="/assets/|href="/assets/?v='$(date +%s)'|g' /var/www/central-rnc/index.html
sed -i 's|src="/assets/|src="/assets/?v='$(date +%s)'|g' /var/www/central-rnc/index.html
```

## ✅ Checklist

- [ ] Build feito localmente (`npm run build`)
- [ ] Arquivos enviados para VPS (`scp dist/*`)
- [ ] Script de atualização executado na VPS
- [ ] Cache do navegador limpo
- [ ] Testado em modo anônimo
- [ ] Verificado timestamp dos arquivos na VPS
- [ ] Nginx reiniciado


