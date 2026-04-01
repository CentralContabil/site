# 🔍 Verificar IP da VPS

## Verificar IPv4 (necessário para DNS)

```bash
# Opção 1: Usar curl com IPv4
curl -4 ifconfig.me

# Opção 2: Usar ip addr
ip addr show | grep "inet " | grep -v 127.0.0.1

# Opção 3: Usar hostname
hostname -I

# Opção 4: Verificar IP público IPv4
curl -4 https://api.ipify.org
```

## Verificar IPv6 (opcional)

```bash
curl -6 ifconfig.me
```

## IP que estávamos usando

- IPv4: `72.60.155.69` (este é o que precisa no DNS)
- IPv6: `2a02:4780:66:4f8f::1` (opcional)

---

**💡 Importante:** Para o DNS funcionar com o Certbot, você precisa configurar o registro **A** (IPv4) apontando para o IP IPv4 da VPS.


