# 🔄 Sincronizar Áreas de Interesse (Job Positions)

## 📋 Passo a Passo

### 1. Exportar dados locais

No seu computador (Windows), execute:

```powershell
node exportar-dados-local.js
```

Isso criará a pasta `dados_exportados` com todos os dados, incluindo `jobPositions.json`.

### 2. Enviar dados para VPS

```powershell
scp -r dados_exportados root@72.60.155.69:/root/app/
```

**OU** se preferir enviar apenas o arquivo de Job Positions:

```powershell
scp dados_exportados\jobPositions.json root@72.60.155.69:/root/app/dados_exportados/
```

### 3. Importar na VPS

Conecte na VPS e execute:

```bash
ssh root@72.60.155.69
cd /root/app
node importar-dados-vps.js
```

## 🚀 Script Rápido (Tudo em um)

Se preferir, execute tudo de uma vez:

```powershell
# 1. Exportar localmente
node exportar-dados-local.js

# 2. Enviar para VPS
scp -r dados_exportados root@72.60.155.69:/root/app/

# 3. Importar na VPS (via SSH)
ssh root@72.60.155.69 "cd /root/app && node importar-dados-vps.js"
```

## ✅ Verificação

Após a importação, verifique na VPS:

```bash
ssh root@72.60.155.69
cd /root/app
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT COUNT(*) FROM job_positions;"
```

Deve mostrar o número de áreas de interesse cadastradas.

## 🔍 Verificar no Site

Acesse: https://central-rnc.com.br/admin/job-positions

As áreas de interesse devem aparecer na lista.


