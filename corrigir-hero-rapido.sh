#!/bin/bash

# Script Rápido para Corrigir Dados do Hero
# Execute na VPS: bash corrigir-hero-rapido.sh

cd /root/app

echo "Corrigindo dados do Hero..."
echo ""

# Verificar se existe registro
EXISTS=$(PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost -t -c "SELECT COUNT(*) FROM hero;" 2>/dev/null | tr -d ' ')

if [ "$EXISTS" = "0" ] || [ -z "$EXISTS" ]; then
    echo "Criando registro do Hero..."
    PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost << 'EOF'
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
  indicator3_value,
  updated_at
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
  'RNC',
  NOW()
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
  indicator3_value = EXCLUDED.indicator3_value,
  updated_at = NOW();
EOF
    echo "   OK: Registro criado/atualizado"
else
    echo "Atualizando registro existente do Hero..."
    PGPASSWORD='SUA_SENHA_VPS_AQUI' psql -U central_rnc_user -d central_rnc -h localhost << 'EOF'
UPDATE hero SET
  badge_text = 'CONTABILIDADE CONSULTIVA',
  title_line1 = 'Soluções que Vão',
  title_line2 = 'Além da Contabilidade',
  description = 'Com mais de 36 anos de atuação, oferecemos consultoria contábil estratégica para impulsionar o crescimento do seu negócio com segurança e inovação.',
  stat_years = '36+',
  stat_clients = '500+',
  stat_network = 'RNC',
  indicator1_title = 'Anos',
  indicator1_value = '36+',
  indicator2_title = 'Clientes',
  indicator2_value = '500+',
  indicator3_title = 'Associado',
  indicator3_value = 'RNC',
  updated_at = NOW()
WHERE id = (SELECT id FROM hero LIMIT 1);
EOF
    echo "   OK: Registro atualizado"
fi

echo ""
echo "Reiniciando aplicacao..."
pm2 restart central-rnc

echo ""
echo "Aguardando 3 segundos..."
sleep 3

echo ""
echo "Testando API:"
curl -s http://localhost:3006/api/hero | head -20

echo ""
echo "Correcao concluida!"
echo "Verifique no site: https://central-rnc.com.br"


