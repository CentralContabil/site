# 🔄 Atualizar VPS para Remover TRAE SOLO

O site local está sem o badge, mas a VPS ainda mostra. Vamos atualizar completamente a VPS.

## 📤 Passo 1: Enviar Arquivos Atualizados para VPS

Do seu computador (PowerShell):

```powershell
# Enviar arquivos atualizados
scp vite.config.ts root@72.60.155.69:/root/app/
scp package.json root@72.60.155.69:/root/app/
scp remover-trae-solo-completo.sh root@72.60.155.69:/root/app/
```

## 🔄 Passo 2: Na VPS - Executar Script Completo

Execute na VPS:

```bash
cd ~/app
chmod +x remover-trae-solo-completo.sh
bash remover-trae-solo-completo.sh
```

## 🔍 Passo 3: Verificar se Está Limpo

Após o script, verifique:

```bash
# Verificar se o build está limpo
grep -r "TRAE\|trae" /root/app/dist/ 2>/dev/null

# Verificar arquivos servidos
grep -r "TRAE\|trae" /var/www/central-rnc/ 2>/dev/null

# Se não retornar nada, está limpo!
```

## 🧹 Passo 4: Limpar Cache do Nginx (Importante!)

```bash
# Recarregar Nginx
sudo systemctl reload nginx

# Se ainda aparecer, limpar cache do navegador
# Ou acesse em modo anônimo: Ctrl+Shift+N
```

## ✅ Passo 5: Verificar no Navegador

1. **Limpe o cache do navegador:**
   - `Ctrl + Shift + Delete`
   - Marque "Imagens e arquivos em cache"
   - Clique em "Limpar dados"

2. **Ou use modo anônimo:**
   - `Ctrl + Shift + N` (Chrome)
   - Acesse: `http://central-rnc.com.br`

3. **Ou force reload:**
   - `Ctrl + F5` (Windows/Linux)

---

**💡 Dica:** Se ainda aparecer após todos os passos, pode ser cache do CDN ou proxy. Aguarde alguns minutos e tente novamente.


