const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// Função de validação
function validarCliente(nome, email, telefone) {
  const erros = [];
  
  // Validar nome
  if (!nome || nome.trim() === '') {
    erros.push('Nome é obrigatório');
  } else if (nome.length < 3) {
    erros.push('Nome deve ter pelo menos 3 caracteres');
  }
  
  // Validar email
  if (!email || email.trim() === '') {
    erros.push('Email é obrigatório');
  } else if (!email.includes('@')) {
    erros.push('Email inválido');
  }
  
  // Validar telefone
  if (telefone && telefone.length < 10) {
    erros.push('Telefone inválido');
  }
  
  return erros;
}

async function adicionarClienteComValidacao(nome, email, telefone) {
  try {
    // Validar
    const erros = validarCliente(nome, email, telefone);
    
    if (erros.length > 0) {
      console.error('❌ Erros de validação:');
      erros.forEach(erro => console.error(`  - ${erro}`));
      return;
    }
    
    // Conectar e inserir
    await client.connect();
    
    const resultado = await client.query(
      'INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, telefone]
    );
    
    console.log('✅ Cliente adicionado com sucesso!');
    console.log('Dados:', resultado.rows[0]);
    
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await client.end();
  }
}

// Testes
console.log('--- Teste 1: Dados válidos ---');
adicionarClienteComValidacao('Déric Martins', 'martins@email.com', '11999999999');

console.log('\n--- Teste 2: Nome vazio ---');
adicionarClienteComValidacao('', 'teste@email.com', '11999999999');

console.log('\n--- Teste 3: Email inválido ---');
adicionarClienteComValidacao('Roberto Alves', 'email-invalido', '47933333333');