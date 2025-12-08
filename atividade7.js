const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function exibirClientes() {
  try {
    await client.connect();
    
    const resultado = await client.query(
      'SELECT id, nome, email, telefone FROM clientes ORDER BY nome'
    );
    
    console.log('\n📋 CLIENTES CADASTRADOS');
    console.log('='.repeat(80));
    
    if (resultado.rows.length === 0) {
      console.log('Nenhum cliente cadastrado');
    } else {
      resultado.rows.forEach(cliente => {
        console.log(`ID: ${cliente.id}`);
        console.log(`Nome: ${cliente.nome}`);
        console.log(`Email: ${cliente.email}`);
        console.log(`Telefone: ${cliente.telefone || 'Não informado'}`);
        console.log('-'.repeat(80));
      });
    }
    
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await client.end();
  }
}

async function exibirProdutos() {
  try {
    await client.connect();
    
    const resultado = await client.query(
      'SELECT id, nome, preco, estoque FROM produtos ORDER BY nome'
    );
    
    console.log('\n📦 PRODUTOS CADASTRADOS');
    console.log('='.repeat(80));
    
    if (resultado.rows.length === 0) {
      console.log('Nenhum produto cadastrado');
    } else {
      let totalValor = 0;
      
      resultado.rows.forEach(produto => {
        const valor = produto.preco * produto.estoque;
        totalValor += valor;
        
        console.log(`ID: ${produto.id}`);
        console.log(`Nome: ${produto.nome}`);
        console.log(`Preço: R$ ${produto.preco.toFixed(2)}`);
        console.log(`Estoque: ${produto.estoque} unidades`);
        console.log(`Valor em estoque: R$ ${valor.toFixed(2)}`);
        console.log('-'.repeat(80));
      });
      
      console.log(`\nValor total em estoque: R$ ${totalValor.toFixed(2)}`);
    }
    
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await client.end();
  }
}

// Executar
(async () => {
  await exibirClientes();
  await exibirProdutos();
  })();