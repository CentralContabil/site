#!/bin/bash

# Script completo para remover TRAE SOLO da VPS
# Execute: bash remover-trae-solo-completo.sh

echo "🗑️  Removendo TRAE SOLO completamente..."
echo ""

cd ~/app || exit 1

# 1. Verificar e atualizar vite.config.ts
echo "📝 Verificando vite.config.ts..."
if grep -q "traeBadgePlugin\|trae-solo-badge" vite.config.ts; then
    echo "   ⚠️  Ainda contém referências ao TRAE SOLO"
    echo "   🔧 Removendo..."
    
    # Remover import
    sed -i '/import.*traeBadgePlugin/d' vite.config.ts
    sed -i '/import.*trae-solo-badge/d' vite.config.ts
    
    # Remover plugin do array
    sed -i '/traeBadgePlugin({/,/}),/d' vite.config.ts
    
    echo "   ✅ Referências removidas"
else
    echo "   ✅ Nenhuma referência encontrada"
fi

# 2. Verificar package.json
echo ""
echo "📦 Verificando package.json..."
if grep -q "vite-plugin-trae-solo-badge" package.json; then
    echo "   ⚠️  Ainda contém dependência"
    echo "   🔧 Removendo..."
    npm uninstall vite-plugin-trae-solo-badge
    echo "   ✅ Dependência removida"
else
    echo "   ✅ Nenhuma dependência encontrada"
fi

# 3. Limpar caches
echo ""
echo "🧹 Limpando caches..."
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite
echo "   ✅ Caches limpos"

# 4. Reinstalar dependências
echo ""
echo "📥 Reinstalando dependências..."
npm install
echo "   ✅ Dependências reinstaladas"

# 5. Fazer build
echo ""
echo "🏗️  Fazendo build..."
npm run build

if [ $? -eq 0 ]; then
    echo "   ✅ Build concluído com sucesso"
    
    # 6. Verificar se o build contém TRAE SOLO
    echo ""
    echo "🔍 Verificando se o build contém TRAE SOLO..."
    if grep -r "TRAE SOLO\|trae-solo\|traeBadge" dist/ 2>/dev/null; then
        echo "   ⚠️  AINDA CONTÉM REFERÊNCIAS NO BUILD!"
        echo "   🔧 Limpando e rebuildando..."
        rm -rf dist
        npm run build
    else
        echo "   ✅ Build limpo, sem referências ao TRAE SOLO"
    fi
    
    # 7. Atualizar arquivos web
    echo ""
    echo "📤 Atualizando arquivos web..."
    sudo rm -rf /var/www/central-rnc/*
    sudo cp -r /root/app/dist/* /var/www/central-rnc/
    sudo chown -R www-data:www-data /var/www/central-rnc
    sudo chmod -R 755 /var/www/central-rnc
    echo "   ✅ Arquivos web atualizados"
    
    # 8. Limpar cache do Nginx
    echo ""
    echo "🔄 Limpando cache do Nginx..."
    sudo systemctl reload nginx
    echo "   ✅ Nginx recarregado"
    
    echo ""
    echo "✅ Processo concluído!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Limpe o cache do navegador (Ctrl+Shift+Delete)"
    echo "   2. Ou abra em modo anônimo/privado"
    echo "   3. Acesse: http://central-rnc.com.br"
    echo ""
    echo "🧪 Testar:"
    echo "   curl http://central-rnc.com.br | grep -i 'trae'"
    echo "   (Se não retornar nada, está limpo!)"
else
    echo "   ❌ Erro no build. Verifique os logs acima."
    exit 1
fi


