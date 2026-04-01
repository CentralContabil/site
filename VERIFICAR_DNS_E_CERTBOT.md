# ✅ Verificar DNS e Obter Certificado SSL

## 🔍 Passo 1: Verificar Propagação DNS

Execute na VPS:

```bash
# Verificar DNS do domínio principal
nslookup central-rnc.com.br

# Verificar DNS do www
nslookup www.central-rnc.com.br

# Deve retornar: 72.60.155.69
```

**Ou teste de outra forma:**

```bash
# Verificar com dig (se disponível)
dig +short central-rnc.com.br
dig +short www.central-rnc.com.br

# Verificar com host
host central-rnc.com.br
host www.central-rnc.com.br
```

## 🧪 Passo 2: Testar Acesso HTTP

```bash
# Testar se o site está acessível via domínio
curl -I http://central-rnc.com.br

# Deve retornar HTTP 200 ou 301/302, não a página "Parked Domain"
```

**Se ainda retornar "Parked Domain":**
- Aguarde mais alguns minutos (propagação pode levar até 24h, geralmente 5-30min)
- Verifique se o DNS foi salvo corretamente no painel da Hostinger

## 🔒 Passo 3: Obter Certificado SSL

Depois que o DNS estiver funcionando:

```bash
sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
```

Siga as instruções:
- Email: `wagner.guerra@gmail.com` (já configurado)
- Aceitar termos: `Y`
- Compartilhar email: `Y` ou `N` (sua escolha)

## ✅ Passo 4: Verificar Certificado

```bash
# Verificar status do certificado
sudo certbot certificates

# Testar renovação (dry-run)
sudo certbot renew --dry-run
```

## 🔄 Passo 5: Verificar Site HTTPS

```bash
# Testar acesso HTTPS
curl -I https://central-rnc.com.br

# Verificar redirecionamento HTTP -> HTTPS
curl -I http://central-rnc.com.br
```

---

**💡 Dica:** Se o DNS ainda não estiver propagado, você pode verificar de diferentes locais:

```bash
# Usar servidor DNS público
nslookup central-rnc.com.br 8.8.8.8
nslookup central-rnc.com.br 1.1.1.1
```


