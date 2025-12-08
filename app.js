const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function conectar() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao conectar:', erro.message);
  } finally {
    await client.end();
  }
}

conectar();