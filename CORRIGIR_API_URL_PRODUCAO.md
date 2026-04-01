# 🔧 Corrigir URL da API em Produção

O problema é que o frontend está tentando usar `http://localhost:3006/api` em produção, mas deveria usar `/api` para que o Nginx faça o proxy.

## ✅ Solução: Ajustar API_BASE_URL

Já corrigi o arquivo `src/services/api.ts`. Agora precisa:

### 1. Rebuild do Frontend

Na VPS:

```bash
cd ~/app
npm run build
```

### 2. Atualizar Arquivos Web

```bash
sudo rm -rf /var/www/central-rnc/*
sudo cp -r /root/app/dist/* /var/www/central-rnc/
sudo chown -R www-data:www-data /var/www/central-rnc
sudo chmod -R 755 /var/www/central-rnc
```

### 3. Verificar se Funcionou

Abra o navegador e:
1. Acesse: `http://central-rnc.com.br`
2. Abra o Console do Desenvolvedor (F12)
3. Vá na aba "Network" (Rede)
4. Recarregue a página (F5)
5. Verifique se as requisições para `/api/*` estão sendo feitas
6. Verifique se há erros no console

## 🔍 Verificar Outros Arquivos

Alguns arquivos podem ter a mesma lógica. Verifique:

```bash
# Na VPS, verificar se há outros arquivos com localhost:3006
grep -r "localhost:3006" /root/app/src/ 2>/dev/null
```

Se encontrar, precisamos corrigir também.

---

**💡 Dica:** A mudança foi de:
- `import.meta.env.DEV ? '/api' : 'http://localhost:3006/api'`
- Para: `'/api'` (sempre usa /api, o Nginx faz o proxy)


