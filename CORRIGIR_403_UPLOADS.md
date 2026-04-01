# 🔧 Corrigir 403 Forbidden em Uploads

## Problema
Imagens em `/uploads/` retornam erro 403 Forbidden. Isso acontece porque o Nginx não tem permissão para acessar os arquivos.

## Solução Rápida

### Na VPS:

```bash
ssh root@72.60.155.69
# Senha: SUA_SENHA_VPS_AQUI

cd /root/app

# Corrigir permissões dos diretórios pais
sudo chmod 755 /root
sudo chmod 755 /root/app
sudo chmod 755 /root/app/public

# Corrigir permissões do diretório uploads
sudo chown -R www-data:www-data /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar se funcionou
sudo -u www-data test -r /root/app/public/uploads && echo "OK" || echo "ERRO"
```

## Script Automático

```bash
# Enviar script para VPS
scp corrigir-uploads-403-vps.sh root@72.60.155.69:/root/app/

# Executar na VPS
ssh root@72.60.155.69
cd /root/app
chmod +x corrigir-uploads-403-vps.sh
bash corrigir-uploads-403-vps.sh
```

## Verificar Configuração do Nginx

```bash
# Verificar se a configuração está correta
cat /etc/nginx/sites-available/central-rnc | grep -A 5 "location /uploads"

# Deve aparecer algo como:
# location /uploads {
#     alias /root/app/public/uploads;
#     expires 30d;
#     add_header Cache-Control "public";
# }
```

## Verificar Logs do Nginx

```bash
# Ver erros recentes
sudo tail -f /var/log/nginx/central-rnc-error.log

# Procurar por erros de permissão
sudo grep -i "permission denied" /var/log/nginx/central-rnc-error.log
```

## Testar Acesso

```bash
# Testar localmente na VPS
curl -I http://localhost/uploads/[nome-do-arquivo.png]

# Testar via HTTPS
curl -I https://central-rnc.com.br/uploads/[nome-do-arquivo.png]
```

## Se Ainda Não Funcionar

1. **Verificar se o diretório existe:**
```bash
ls -la /root/app/public/uploads
```

2. **Verificar propriedade dos arquivos:**
```bash
ls -la /root/app/public/uploads | head -10
```

3. **Verificar se Nginx pode acessar:**
```bash
sudo -u www-data ls /root/app/public/uploads
```

4. **Verificar configuração do Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```


