# 🔄 Atualizar Menu do Admin na VPS

## 🚨 Problema
O menu do admin na VPS está desatualizado, mas o localhost está correto.

## ✅ Solução

### Passo 1: Build Local
```powershell
npm run build
```

### Passo 2: Enviar para VPS

**Opção A - SCP:**
```powershell
scp -r dist/* root@72.60.155.69:/root/app/dist/
# Senha: SUA_SENHA_VPS_AQUI
```

**Opção B - WinSCP/FileZilla:**
- Host: `72.60.155.69`
- Usuário: `root`
- Senha: `SUA_SENHA_VPS_AQUI`
- Enviar pasta `dist` para `/root/app/dist/`

### Passo 3: Na VPS

Conecte via SSH:
```bash
ssh root@72.60.155.69
# Senha: SUA_SENHA_VPS_AQUI
```

Execute:
```bash
cd /root/app

# Copiar arquivos estáticos para Nginx
sudo rm -rf /var/www/central-rnc/*
sudo cp -r dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc

# Reiniciar Nginx
sudo systemctl reload nginx
```

### Passo 4: Limpar Cache do Navegador

**No navegador:**
- Pressione `Ctrl + Shift + Delete` para limpar cache
- OU pressione `Ctrl + F5` na página do admin para forçar recarregamento

## ✅ Verificação

Acesse: https://central-rnc.com.br/admin/dashboard

O menu deve mostrar:
- ✅ **RH** (com subitens: Candidaturas, Áreas de Interesse, Processos Seletivos)
- ✅ **Seções do Site** (expandido)
- ✅ **Páginas** (expandido)

## 🐛 Se ainda não funcionar

**1. Verificar se os arquivos foram copiados:**
```bash
ls -la /var/www/central-rnc/assets/
```

**2. Verificar logs do Nginx:**
```bash
sudo tail -f /var/log/nginx/central-rnc-error.log
```

**3. Limpar cache do Nginx:**
```bash
sudo systemctl restart nginx
```

**4. Verificar se o build está correto:**
```bash
# Na VPS, verificar timestamp dos arquivos
ls -lh /var/www/central-rnc/assets/index-*.js
```


