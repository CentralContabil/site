# 🔧 Corrigir vite.config.ts na VPS

O erro ocorre porque o `vite.config.ts` na VPS ainda tem a importação do plugin removido.

## ✅ Solução: Atualizar arquivo na VPS

### Opção 1: Editar diretamente na VPS

Execute na VPS:

```bash
cd ~/app
nano vite.config.ts
```

Remova estas linhas:
- Linha 4: `import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';`
- Linhas 16-24: Todo o bloco `traeBadgePlugin({...})`

O arquivo deve ficar assim:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3006',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`.

### Opção 2: Enviar arquivo do computador

Do seu computador (PowerShell):

```powershell
scp vite.config.ts root@72.60.155.69:/root/app/
```

## 🔄 Depois de atualizar

```bash
cd ~/app

# Limpar cache do Vite
rm -rf node_modules/.vite
rm -rf dist

# Remover dependência (se ainda estiver)
npm uninstall vite-plugin-trae-solo-badge

# Tentar build novamente
npm run build
```

## ✅ Se ainda der erro

Verifique se o arquivo está correto:

```bash
cat vite.config.ts | grep -i "trae"
```

Se retornar algo, o arquivo ainda não foi atualizado corretamente.


