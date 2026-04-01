# 🔧 Corrigir Problemas na VPS

## 🚨 Problemas Identificados

1. **Variáveis do Hero não carregam** (36+, 500+, RNC)
2. **Erros 403 Forbidden** nos uploads (permissões)
3. **Erro `getFeatures is not a function`**

## ✅ Correções Aplicadas

### 1. Adicionado método `getFeatures` ao `apiService`
- Arquivo: `src/services/api.ts`
- Método: `async getFeatures(): Promise<{ features: any[] }>`

### 2. Adicionada interface `Feature` ao types
- Arquivo: `src/types/index.ts`
- Interface: `export interface Feature`

## 🚀 Deploy das Correções

**1. Fazer build local:**
```powershell
npm run build
```

**2. Enviar para VPS:**
```powershell
.\deploy-vps-completo.ps1
```

**OU manualmente:**
```powershell
# Enviar apenas os arquivos modificados
scp src/services/api.ts root@72.60.155.69:/root/app/src/services/
scp src/types/index.ts root@72.60.155.69:/root/app/src/types/
scp dist/* root@72.60.155.69:/root/app/dist/
```

**3. Na VPS, executar script de correção:**
```bash
ssh root@72.60.155.69
cd /root/app
bash corrigir-todos-problemas-vps.sh
```

## 📋 O que o script faz:

1. ✅ Corrige dados do Hero no banco
2. ✅ Corrige permissões dos uploads
3. ✅ Verifica configuração do Nginx
4. ✅ Reinicia PM2 e Nginx
5. ✅ Testa APIs

## ✅ Verificação

Após o deploy, verifique:

1. **Hero carregando:**
   - Acesse: https://central-rnc.com.br
   - As estatísticas (36+, 500+, RNC) devem aparecer

2. **Features carregando:**
   - Abra o console do navegador
   - Não deve haver erro "getFeatures is not a function"

3. **Uploads funcionando:**
   - Tente fazer upload de uma imagem
   - Não deve retornar 403 Forbidden

## 🐛 Se ainda houver problemas

**Verificar logs:**
```bash
pm2 logs central-rnc --lines 50
```

**Verificar API:**
```bash
curl http://localhost:3006/api/hero
curl http://localhost:3006/api/sections/features
```

**Verificar permissões:**
```bash
ls -la /root/app/public/uploads
```


