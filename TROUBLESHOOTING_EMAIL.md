# 🔧 Troubleshooting - Email de Verificação Não Chegando

## 📋 Checklist de Diagnóstico

### 1. Verificar Variáveis de Ambiente

O email precisa das seguintes variáveis no arquivo `.env` na raiz do projeto:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

**⚠️ IMPORTANTE:**
- Para Gmail, você precisa usar uma **Senha de App**, não sua senha normal
- A senha de app é gerada nas configurações de segurança do Google

### 2. Como Gerar Senha de App no Gmail

1. Acesse: https://myaccount.google.com/security
2. Ative a **Verificação em duas etapas** (se ainda não tiver)
3. Vá em **Senhas de app**
4. Selecione **App**: "Email" e **Dispositivo**: "Outro (nome personalizado)"
5. Digite um nome (ex: "Central Contábil")
6. Clique em **Gerar**
7. Copie a senha gerada (16 caracteres) e use no `.env` como `SMTP_PASS`

### 3. Verificar Logs do Servidor

Quando você tenta fazer login, verifique os logs do terminal onde o servidor está rodando. Você deve ver:

```
📧 EmailService inicializado:
📧 Host: smtp.gmail.com
📧 Port: 587
📧 User: seu-email@gmail.com
📧 Pass configurada: Sim
```

Se aparecer `Pass configurada: Não`, significa que `SMTP_PASS` não está configurada.

### 4. Erros Comuns

#### ❌ Erro: "Configuração de email não encontrada ou inválida"
**Solução:** Verifique se `SMTP_USER` e `SMTP_PASS` estão no `.env` e não são os valores padrão (`seu-email@gmail.com` ou `sua-senha-app`)

#### ❌ Erro: "EAUTH" (Erro de autenticação)
**Solução:** 
- Verifique se está usando Senha de App (não senha normal)
- Verifique se a verificação em duas etapas está ativada
- Gere uma nova senha de app

#### ❌ Erro: "ECONNECTION" (Erro de conexão)
**Solução:**
- Verifique se `SMTP_HOST` está correto
- Verifique se `SMTP_PORT` está correto (587 para Gmail)
- Verifique sua conexão com a internet
- Alguns provedores bloqueiam SMTP - tente usar outro provedor

#### ❌ Erro: "ETIMEDOUT" (Timeout)
**Solução:**
- Verifique sua conexão com a internet
- Tente usar outro provedor de email
- Verifique se o firewall não está bloqueando

### 5. Testar Configuração

Para testar se a configuração está funcionando, você pode verificar os logs quando tentar fazer login:

1. Tente fazer login
2. Veja os logs no terminal do servidor
3. Procure por mensagens como:
   - `✅ Conexão SMTP verificada com sucesso` - Configuração OK
   - `❌ Erro ao verificar conexão SMTP` - Problema na configuração
   - `✅ Email de verificação enviado com sucesso!` - Email enviado
   - `❌ Erro ao enviar email de verificação` - Falha no envio

### 6. Alternativas de Provedor SMTP

Se Gmail não funcionar, você pode usar outros provedores:

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-do-sendgrid
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=seu-usuario-mailgun
SMTP_PASS=sua-senha-mailgun
```

### 7. Verificar se o Email Foi Enviado

Mesmo que não chegue na sua caixa de entrada, verifique:
- ✅ **Pasta de Spam/Lixo Eletrônico**
- ✅ **Filtros de email**
- ✅ **Regras de encaminhamento**

### 8. Código no Banco de Dados

O código é salvo no banco de dados mesmo se o email falhar. Para verificar:

1. Abra o banco de dados (SQLite: `prisma/dev.db`)
2. Consulte a tabela `AuthCode`
3. Veja se há códigos recentes para seu email

**Nota:** Por segurança, o código só é exibido no email, não no banco de dados diretamente.

### 9. Solução Temporária para Desenvolvimento

Se você precisar testar sem configurar SMTP, pode:

1. Verificar o código diretamente no banco de dados
2. Ou modificar temporariamente o código para exibir no console (apenas para desenvolvimento)

---

## 🆘 Ainda Não Funciona?

Se após seguir todos os passos o email ainda não chegar:

1. **Compartilhe os logs do servidor** quando tentar fazer login
2. **Verifique se o arquivo `.env` está na raiz do projeto** (mesmo nível que `package.json`)
3. **Reinicie o servidor** após alterar o `.env`
4. **Verifique se não há espaços extras** nas variáveis do `.env`




