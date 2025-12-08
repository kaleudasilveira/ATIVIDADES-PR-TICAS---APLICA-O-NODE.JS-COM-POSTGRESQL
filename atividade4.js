const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function adicionarVariosClientes() {
  try {
    await client.connect();
    
    const clientes = [
      ['Pedro Oliveira', 'pedro@email.com', '11977777777'],
      ['Ana Costa', 'ana@email.com', '21966666666'],
      ['Carlos Mendes', 'carlos@email.com', '31955555555']
    ];
    
    let contador = 0;
    
    for (const [nome, email, telefone] of clientes) {
      await client.query(
        'INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3)',
        [nome, email, telefone]
      );
      contador++;
    }
    
    console.log(`✅ ${contador} clientes adicionados com sucesso!`);
    
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await client.end();
  }
}

adicionarVariosClientes();