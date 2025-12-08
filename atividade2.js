const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function listarClientes() {
  try {
    await client.connect();
    
    const resultado = await client.query('SELECT * FROM clientes');
    
    console.log('📋 Clientes cadastrados:');
    console.log(resultado.rows);
    
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await client.end();
  }
}

listarClientes();