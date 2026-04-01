# 🗑️ Remover Badge "TRAE SOLO"

O badge "TRAE SOLO" foi removido do código. Agora você precisa:

## 📤 Passo 1: Enviar arquivos atualizados para VPS

Do seu computador, envie os arquivos atualizados:

```powershell
# Enviar vite.config.ts e package.json
scp vite.config.ts root@72.60.155.69:/root/app/
scp package.json root@72.60.155.69:/root/app/
```

## 🔄 Passo 2: Na VPS - Atualizar dependências e rebuild

Execute na VPS:

```bash
cd ~/app

# Remover dependência (se ainda estiver instalada)
npm uninstall vite-plugin-trae-solo-badge

# Instalar dependências atualizadas
npm install

# Fazer rebuild do frontend
npm run build

# Copiar build atualizado para o diretório web
sudo rm -rf /var/www/central-rnc/*
sudo cp -r /root/app/dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc
```

## ✅ Passo 3: Verificar

Acesse o site e verifique se o badge "TRAE SOLO" foi removido:

```bash
# Testar no navegador
curl http://central-rnc.com.br | grep -i "trae"
```

Se não retornar nada, o badge foi removido com sucesso!

---

**💡 Nota:** Se você usar PM2, pode precisar reiniciar:

```bash
pm2 restart central-rnc
```


