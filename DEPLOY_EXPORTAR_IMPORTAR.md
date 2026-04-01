# 🚀 Deploy das Funcionalidades de Exportar/Importar

## 📋 Passos para Deploy

### 1. Build Local (Já feito ✅)
```powershell
npm run build
```

### 2. Enviar Arquivos para VPS

**Opção A: Usando SCP (será necessário digitar a senha)**
```powershell
# Senha: SUA_SENHA_VPS_AQUI
scp -r dist/* root@72.60.155.69:/root/app/dist/
```

**Opção B: Usando WinSCP ou FileZilla**
- Host: `72.60.155.69`
- Usuário: `root`
- Senha: `SUA_SENHA_VPS_AQUI`
- Enviar pasta `dist` para `/root/app/dist/`

### 3. Na VPS, Executar Comandos

Conecte via SSH:
```bash
ssh root@72.60.155.69
# Senha: SUA_SENHA_VPS_AQUI
```

Execute os comandos:
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

### 4. Verificar

Acesse: https://central-rnc.com.br/admin/job-positions

Você deve ver os botões:
- **Exportar** (ícone de download)
- **Importar** (ícone de upload)
- **Nova Área**

## ✅ Teste Rápido

1. Clique em **Exportar** → Deve baixar um arquivo JSON
2. Clique em **Importar** → Selecione o arquivo JSON → Deve importar as áreas

## 🐛 Se algo não funcionar

Verifique os logs do Nginx:
```bash
sudo tail -f /var/log/nginx/central-rnc-error.log
```

Verifique se os arquivos foram copiados:
```bash
ls -la /var/www/central-rnc/
```


