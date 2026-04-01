# 🔧 Corrigir Dados do Hero na VPS

## 🚨 Problema
Os dados do Hero (estatísticas: 36+, 500+, RNC) não estão aparecendo na VPS.

## 🔍 Diagnóstico

Execute na VPS:

```bash
ssh root@72.60.155.69
cd /root/app
bash verificar-hero-vps.sh
```

## 🔧 Correção

### Opção 1: Importar apenas Hero

**1. No Windows, exporte os dados:**
```powershell
node exportar-dados-local.js
```

**2. Envie apenas o arquivo do Hero:**
```powershell
scp dados_exportados\heroes.json root@72.60.155.69:/root/app/dados_exportados/
```

**3. Na VPS, importe:**
```bash
ssh root@72.60.155.69
cd /root/app
node importar-hero-vps.js
```

**4. Reinicie a aplicação:**
```bash
pm2 restart central-rnc
```

### Opção 2: Verificar e Corrigir Manualmente

**1. Verificar dados no banco:**
```bash
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost -c "SELECT * FROM hero;"
```

**2. Se não houver dados, criar registro padrão:**
```bash
PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost << EOF
INSERT INTO hero (
  id, 
  badge_text, 
  title_line1, 
  title_line2, 
  description,
  stat_years,
  stat_clients,
  stat_network,
  indicator1_title,
  indicator1_value,
  indicator2_title,
  indicator2_value,
  indicator3_title,
  indicator3_value
) VALUES (
  'hero-1',
  'CONTABILIDADE CONSULTIVA',
  'Soluções que Vão',
  'Além da Contabilidade',
  'Com mais de 36 anos de atuação, oferecemos consultoria contábil estratégica para impulsionar o crescimento do seu negócio com segurança e inovação.',
  '36+',
  '500+',
  'RNC',
  'Anos',
  '36+',
  'Clientes',
  '500+',
  'Associado',
  'RNC'
) ON CONFLICT (id) DO UPDATE SET
  badge_text = EXCLUDED.badge_text,
  title_line1 = EXCLUDED.title_line1,
  title_line2 = EXCLUDED.title_line2,
  description = EXCLUDED.description,
  stat_years = EXCLUDED.stat_years,
  stat_clients = EXCLUDED.stat_clients,
  stat_network = EXCLUDED.stat_network,
  indicator1_title = EXCLUDED.indicator1_title,
  indicator1_value = EXCLUDED.indicator1_value,
  indicator2_title = EXCLUDED.indicator2_title,
  indicator2_value = EXCLUDED.indicator2_value,
  indicator3_title = EXCLUDED.indicator3_title,
  indicator3_value = EXCLUDED.indicator3_value;
EOF
```

**3. Reiniciar aplicação:**
```bash
pm2 restart central-rnc
```

## ✅ Verificação

**1. Testar API:**
```bash
curl http://localhost:3006/api/hero
```

Deve retornar os dados do Hero com todos os campos.

**2. Verificar no site:**
- Acesse: https://central-rnc.com.br
- As estatísticas (36+, 500+, RNC) devem aparecer

## 🐛 Se ainda não funcionar

**Verificar logs:**
```bash
pm2 logs central-rnc --lines 50
```

**Verificar se Prisma Client está atualizado:**
```bash
npx prisma generate
pm2 restart central-rnc
```


