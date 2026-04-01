#!/bin/bash

# Script para Corrigir TODOS os Problemas na VPS
# Execute: bash corrigir-todos-problemas-vps.sh

cd /root/app

echo "=========================================="
echo "Corrigindo TODOS os problemas na VPS..."
echo "=========================================="
echo ""

# 1. Corrigir dados do Hero
echo "1. Corrigindo dados do Hero..."
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
echo "   OK: Hero corrigido"
echo ""

# 2. Corrigir permissões dos uploads
echo "2. Corrigindo permissões dos uploads..."
sudo chmod 755 /root
sudo chmod 755 /root/app
sudo chmod 755 /root/app/public
sudo chown -R www-data:www-data /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads
echo "   OK: Permissões corrigidas"
echo ""

# 3. Verificar se Nginx está configurado corretamente
echo "3. Verificando configuração do Nginx..."
if grep -q "location /uploads" /etc/nginx/sites-available/central-rnc; then
    echo "   OK: Nginx configurado para /uploads"
else
    echo "   AVISO: Verifique a configuração do Nginx para /uploads"
fi
echo ""

# 4. Reiniciar serviços
echo "4. Reiniciando serviços..."
pm2 restart central-rnc
sudo systemctl reload nginx
echo "   OK: Serviços reiniciados"
echo ""

# 5. Testar API
echo "5. Testando APIs..."
echo "   Testando /api/hero:"
curl -s http://localhost:3006/api/hero | head -5
echo ""
echo "   Testando /api/sections/features:"
curl -s http://localhost:3006/api/sections/features | head -5
echo ""

echo "=========================================="
echo "Correção concluída!"
echo "=========================================="
echo ""
echo "Verifique no site: https://central-rnc.com.br"
echo ""


