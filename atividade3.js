const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function adicionarCliente(nome, email, telefone) {
  try {
    await client.connect();
    
    // Validar dados
    if (!nome || !email) {
      throw new Error('Nome e email são obrigatórios');
    }
    
    // Inserir
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

// Usar
adicionarCliente('Déric Martins', 'martins@email.com', '11999999999');