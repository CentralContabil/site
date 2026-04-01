#!/bin/bash
# Script para verificar e liberar a porta 3006

echo "🔍 Verificando processos usando a porta 3006..."
echo ""

# Verificar se há processos usando a porta 3006
PROCESSES=$(lsof -ti:3006 2>/dev/null || netstat -tuln | grep :3006 2>/dev/null || ss -tuln | grep :3006 2>/dev/null)

if [ -z "$PROCESSES" ]; then
  echo "✅ Porta 3006 está livre"
else
  echo "⚠️  Porta 3006 está em uso!"
  echo ""
  echo "Processos encontrados:"
  
  # Tentar diferentes métodos para encontrar processos
  if command -v lsof &> /dev/null; then
    lsof -i:3006
  elif command -v netstat &> /dev/null; then
    netstat -tulpn | grep :3006
  elif command -v ss &> /dev/null; then
    ss -tulpn | grep :3006
  fi
  
  echo ""
  echo "🛑 Parando processos PM2 que possam estar usando a porta..."
  
  # Parar todas as instâncias do PM2
  pm2 stop all 2>/dev/null
  pm2 delete all 2>/dev/null
  
  # Tentar matar processos diretamente (se necessário)
  if command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti:3006 2>/dev/null)
    if [ -n "$PIDS" ]; then
      echo "   Encontrados PIDs: $PIDS"
      read -p "   Deseja matar esses processos? (s/N): " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Ss]$ ]]; then
        kill -9 $PIDS 2>/dev/null
        echo "   ✅ Processos encerrados"
      fi
    fi
  fi
fi

echo ""
echo "📋 Verificando aplicações PM2:"
pm2 list

echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "   1. Verifique qual porta a KingHost está fornecendo:"
echo "      env | grep PORT"
echo ""
echo "   2. Se necessário, recrie a aplicação:"
echo "      pm2 delete site"
echo "      pm2 start start.sh --name site"
echo ""
echo "   3. Verifique os logs:"
echo "      pm2 logs site"



