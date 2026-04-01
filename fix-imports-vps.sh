#!/bin/bash

# Script para corrigir imports case-sensitive na VPS
# Execute na VPS: bash fix-imports-vps.sh

echo "🔧 Corrigindo imports case-sensitive..."
echo ""

cd ~/app/src || exit 1

# Corrigir imports de Button
echo "📝 Corrigindo imports de Button..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|@/components/ui/button|@/components/ui/Button|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|'../../components/ui/button'|'../../components/ui/Button'|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|\"../../components/ui/button\"|\"../../components/ui/Button\"|g"

# Corrigir imports de Card
echo "📝 Corrigindo imports de Card..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|@/components/ui/card|@/components/ui/Card|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|'../../components/ui/card'|'../../components/ui/Card'|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|\"../../components/ui/card\"|\"../../components/ui/Card\"|g"

# Corrigir imports de Input
echo "📝 Corrigindo imports de Input..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|@/components/ui/input|@/components/ui/Input|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|'../../components/ui/input'|'../../components/ui/Input'|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|\"../../components/ui/input\"|\"../../components/ui/Input\"|g"

# Corrigir imports de Textarea (garantir minúsculo)
echo "📝 Corrigindo imports de Textarea..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|@/components/ui/Textarea|@/components/ui/textarea|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|'../../components/ui/Textarea'|'../../components/ui/textarea'|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|\"../../components/ui/Textarea\"|\"../../components/ui/textarea\"|g"

# Corrigir imports de Label (garantir minúsculo)
echo "📝 Corrigindo imports de Label..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|@/components/ui/Label|@/components/ui/label|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|'../../components/ui/Label'|'../../components/ui/label'|g"
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|\"../../components/ui/Label\"|\"../../components/ui/label\"|g"

echo ""
echo "✅ Imports corrigidos!"
echo ""
echo "📋 Verificando imports corrigidos..."
grep -r "@/components/ui/button\|@/components/ui/card\|@/components/ui/input" src/ 2>/dev/null | head -5 || echo "   ✅ Nenhum import incorreto encontrado"

echo ""
echo "🚀 Tente o build novamente:"
echo "   cd ~/app && npm run build"


