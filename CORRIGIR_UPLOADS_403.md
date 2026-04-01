# 🔧 Corrigir Erro 403 em Uploads

O erro 403 indica que o Nginx não tem permissão para acessar a pasta de uploads.

## 🚀 Solução Rápida: Script Automático

Execute na VPS:

```bash
cd ~/app
chmod +x corrigir-uploads-403.sh
bash corrigir-uploads-403.sh
```

## ✅ Solução Manual: Corrigir Permissões

**🔴 PROBLEMA:** O diretório `/root/app/public` tem permissões `700` (drwx------), então o Nginx não consegue navegar até a pasta `uploads`.

Execute na VPS:

```bash
# 1. Criar pasta se não existir
mkdir -p /root/app/public/uploads

# 2. Corrigir permissões dos diretórios PAIS (CRÍTICO!)
# O Nginx precisa ter permissão de execução (x) para navegar pelos diretórios
sudo chmod 755 /root
sudo chmod 755 /root/app
sudo chmod 755 /root/app/public

# 3. Dar permissões corretas na pasta uploads
sudo chown -R www-data:www-data /root/app/public/uploads
sudo chmod -R 755 /root/app/public/uploads

# 4. Verificar se funcionou
ls -la /root/app/ | grep public
ls -la /root/app/public/ | grep uploads

# 5. Testar se o Nginx consegue acessar
sudo -u www-data ls -la /root/app/public/uploads/

# 6. Recarregar Nginx
sudo systemctl reload nginx
```

**⚠️ IMPORTANTE:** 
- O Nginx roda como usuário `www-data`
- Os diretórios PAIS precisam ter permissão de execução (x) para o Nginx navegar até a pasta
- A pasta `uploads` precisa pertencer a `www-data`

## 🔍 Verificar Configuração do Nginx

A configuração do Nginx deve estar assim (e DEVE vir ANTES de `location /`):

```nginx
# Uploads (arquivos enviados) - DEVE vir ANTES de location /
location /uploads {
    alias /root/app/public/uploads;
    expires 30d;
    add_header Cache-Control "public";
}

# Frontend (arquivos estáticos) - DEVE vir DEPOIS
location / {
    root /var/www/central-rnc;
    try_files $uri $uri/ /index.html;
}
```

Verifique a ordem:

```bash
sudo cat /etc/nginx/sites-available/central-rnc | grep -n "location"
```

A ordem deve ser:
1. `location /.well-known/acme-challenge/` (para SSL)
2. `location /api/` (para API)
3. `location /uploads` (para uploads)
4. `location /` (para frontend - por último!)

## ✅ Solução Alternativa: Usar /var/www

Se ainda não funcionar, mova os uploads para um local mais acessível:

```bash
# 1. Criar pasta em /var/www
sudo mkdir -p /var/www/uploads

# 2. Mover uploads existentes (se houver)
sudo mv /root/app/public/uploads/* /var/www/uploads/ 2>/dev/null || true

# 3. Dar permissões
sudo chown -R www-data:www-data /var/www/uploads
sudo chmod -R 755 /var/www/uploads

# 4. Criar link simbólico
sudo rm -rf /root/app/public/uploads
sudo ln -s /var/www/uploads /root/app/public/uploads

# 5. Atualizar Nginx
sudo nano /etc/nginx/sites-available/central-rnc
```

Altere a configuração para:

```nginx
location /uploads {
    alias /var/www/uploads;
    expires 30d;
    add_header Cache-Control "public";
}
```

Depois:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Verificar se Funcionou

```bash
# Testar acesso (se houver arquivo)
curl -I http://central-rnc.com.br/uploads/164a7fc8-d492-46d1-9b93-42cff146166b.png

# Verificar logs do Nginx
sudo tail -20 /var/log/nginx/central-rnc-error.log

# Verificar permissões
ls -la /root/app/public/uploads/
```

## 🐛 Debug Adicional

Se ainda não funcionar:

```bash
# 1. Verificar se o Nginx pode acessar a pasta
sudo -u www-data ls -la /root/app/public/uploads/

# 2. Verificar SELinux (se aplicável)
getenforce 2>/dev/null || echo "SELinux não está ativo"

# 3. Verificar se a pasta está no caminho correto
realpath /root/app/public/uploads
```

---

**💡 Dica:** O problema geralmente é permissão. O Nginx roda como `www-data`, então precisa ter acesso à pasta `/root/app/public/uploads`.

