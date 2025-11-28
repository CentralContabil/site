/**
 * Script para testar o envio de email
 * Execute: npx tsx api/scripts/test-email.ts
 */

import dotenv from 'dotenv';
import { emailService } from '../services/emailService.js';

// Carrega variáveis de ambiente
dotenv.config();

async function testEmail() {
  console.log('\n🧪 Testando configuração de email...\n');
  
  // Verifica variáveis de ambiente
  console.log('📋 Configurações:');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'não configurado');
  console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'não configurado');
  console.log('  SMTP_USER:', process.env.SMTP_USER || 'não configurado');
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '***configurado***' : 'não configurado');
  console.log('');

  // Solicita email de teste
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('📧 Digite o email para receber o teste: ', async (email: string) => {
    readline.close();

    if (!email || !email.includes('@')) {
      console.error('❌ Email inválido');
      process.exit(1);
    }

    const testCode = '123456';
    console.log(`\n📤 Enviando email de teste para: ${email}`);
    console.log(`📝 Código de teste: ${testCode}\n`);

    try {
      const result = await emailService.sendVerificationCode(email, testCode, 'Teste');
      
      if (result) {
        console.log('\n✅ Email enviado com sucesso!');
        console.log('📬 Verifique sua caixa de entrada e pasta de spam.');
        console.log(`🔑 Código de teste: ${testCode}\n`);
      } else {
        console.log('\n❌ Falha ao enviar email.');
        console.log('💡 Verifique os logs acima para mais detalhes.\n');
      }
    } catch (error: any) {
      console.error('\n❌ Erro ao enviar email:');
      console.error('  Tipo:', error?.constructor?.name);
      console.error('  Mensagem:', error?.message);
      console.error('  Código:', error?.code);
      console.error('\n💡 Dicas:');
      console.error('  - Verifique se SMTP_USER e SMTP_PASS estão corretos no .env');
      console.error('  - Para Gmail, use uma Senha de App (não a senha normal)');
      console.error('  - Verifique se a verificação em duas etapas está ativada\n');
    }

    process.exit(0);
  });
}

testEmail();




