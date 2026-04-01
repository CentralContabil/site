# Instalar PuTTY para Windows (Opcional)

O script `sincronizar-completo-vps-windows.ps1` funciona melhor com PuTTY instalado, pois permite passar a senha automaticamente.

## Opção 1: Instalar PuTTY via Chocolatey

```powershell
choco install putty
```

## Opção 2: Baixar PuTTY Manualmente

1. Acesse: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
2. Baixe o instalador para Windows
3. Instale normalmente

## Opção 3: Usar sem PuTTY

O script também funciona sem PuTTY, mas você precisará informar a senha manualmente quando solicitado.

**Senha:** `SUA_SENHA_VPS_AQUI`

## Verificar se PuTTY está instalado

```powershell
plink -V
```

Se o comando funcionar, o PuTTY está instalado e o script usará automaticamente.


