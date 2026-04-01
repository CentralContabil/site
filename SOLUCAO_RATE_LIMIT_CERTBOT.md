# ⏰ Solução: Rate Limit do Let's Encrypt

O Let's Encrypt bloqueou temporariamente devido a muitas tentativas falhas (5 tentativas nos últimos 60 minutos).

## 🔍 Informação do Erro

- **Limite:** 5 falhas por domínio por hora
- **Tempo de espera:** Até `2025-12-02 18:51:11 UTC` (aproximadamente 1 hora)
- **Motivo:** Múltiplas tentativas anteriores falharam devido ao DNS não configurado

## ✅ Soluções

### Opção 1: Aguardar e Tentar Novamente (Recomendado)

O rate limit será resetado após 1 hora. Aguarde até depois de `18:51:11 UTC` e tente novamente:

```bash
# Verificar hora atual
date

# Aguardar e tentar novamente depois do horário indicado
sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
```

### Opção 2: Usar Modo Standalone (Alternativa)

Se precisar urgentemente, pode tentar o modo standalone (requer parar o Nginx temporariamente):

```bash
# Parar Nginx
sudo systemctl stop nginx

# Obter certificado em modo standalone
sudo certbot certonly --standalone -d central-rnc.com.br -d www.central-rnc.com.br

# Reiniciar Nginx
sudo systemctl start nginx

# Configurar Nginx para usar o certificado (se necessário)
sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
```

**⚠️ ATENÇÃO:** O modo standalone pode não funcionar se o rate limit ainda estiver ativo.

### Opção 3: Aguardar Mais Tempo

Se o rate limit persistir, aguarde algumas horas (o limite é por hora, mas pode levar mais tempo para resetar completamente).

## 🧪 Verificar Status

```bash
# Verificar certificados existentes
sudo certbot certificates

# Verificar logs
sudo tail -50 /var/log/letsencrypt/letsencrypt.log
```

## 📋 Próximos Passos (Após Rate Limit Resetar)

1. **Aguardar** até depois de `18:51:11 UTC`
2. **Verificar DNS** novamente:
   ```bash
   nslookup central-rnc.com.br
   nslookup www.central-rnc.com.br
   ```
3. **Testar acesso HTTP**:
   ```bash
   curl -I http://central-rnc.com.br
   ```
4. **Tentar Certbot novamente**:
   ```bash
   sudo certbot --nginx -d central-rnc.com.br -d www.central-rnc.com.br
   ```

## 💡 Dica

Enquanto aguarda, você pode:
- Verificar se o site está funcionando corretamente via HTTP
- Testar a área administrativa
- Verificar logs do PM2 e Nginx
- Configurar outras coisas do projeto

---

**⏰ Horário para tentar novamente:** Depois de `18:51:11 UTC` (verifique com `date` na VPS)


