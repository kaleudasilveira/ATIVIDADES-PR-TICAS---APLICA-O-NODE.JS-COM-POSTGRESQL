const { Client } = require('pg');
require('dotenv').config();

// Configuração
function criarCliente() {
  return new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  });
}

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

function validarCliente(nome, email) {
  const erros = [];
  
  if (!nome || nome.trim() === '') {
    erros.push('Nome é obrigatório');
  } else if (nome.length < 3) {
    erros.push('Nome deve ter pelo menos 3 caracteres');
  }
  
  if (!email || email.trim() === '') {
    erros.push('Email é obrigatório');
  } else if (!email.includes('@')) {
    erros.push('Email inválido');
  }
  
  return erros;
}

function validarProduto(nome, preco) {
  const erros = [];
  
  if (!nome || nome.trim() === '') {
    erros.push('Nome é obrigatório');
  }
  
  if (!preco || preco <= 0) {
    erros.push('Preço deve ser maior que zero');
  }
  
  return erros;
}

// ============================================
// FUNÇÕES DE CLIENTE
// ============================================

async function adicionarCliente(nome, email, telefone = '') {
  const client = criarCliente();

  try {
    const erros = validarCliente(nome, email);
    if (erros.length > 0) {
      console.error('❌ Erros de validação:');
      erros.forEach(e => console.error(`  - ${e}`));
      return false;
    }
    
    await client.connect();
    
    const resultado = await client.query(
      'INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING id',
      [nome, email, telefone]
    );
    
    console.log(`✅ Cliente "${nome}" adicionado com sucesso! (ID: ${resultado.rows[0].id})`);
    return true;
    
  } catch (erro) {
    if (erro.message.includes('duplicate key')) {
      console.error('❌ Email já cadastrado');
    } else {
      console.error('❌ Erro:', erro.message);
    }
    return false;
  } finally {
    await client.end();
  }
}

async function listarClientes() {
  const client = criarCliente();

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
        console.log(`[${cliente.id}] ${cliente.nome} | ${cliente.email} | ${cliente.telefone || '-'}`);
      });
      console.log(`\nTotal: ${resultado.rows.length} cliente(s)`);
    }
    
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await client.end();
  }
}

// ============================================
// FUNÇÕES DE PRODUTO
// ============================================

async function adicionarProduto(nome, preco, estoque = 0) {
  const client = criarCliente();

  try {
    const erros = validarProduto(nome, preco);
    if (erros.length > 0) {
      console.error('❌ Erros de validação:');
      erros.forEach(e => console.error(`  - ${e}`));
      return false;
    }
    
    await client.connect();
    
    const resultado = await client.query(
      'INSERT INTO produtos (nome, preco, estoque) VALUES ($1, $2, $3) RETURNING id',
      [nome, preco, estoque]
    );
    
    console.log(`✅ Produto "${nome}" adicionado com sucesso! (ID: ${resultado.rows[0].id})`);
    return true;
    
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    return false;
  } finally {
    await client.end();
  }
}

async function listarProdutos() {
  const client = criarCliente();

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
     const preco = Number(produto.preco);
     const estoque = Number(produto.estoque);

     const valor = preco * estoque;
     totalValor += valor;

    console.log(
       `[${produto.id}] ${produto.nome} | R$ ${preco.toFixed(2)} | Estoque: ${estoque}`
  );
});
      console.log(`\nTotal: ${resultado.rows.length} produto(s)`);
      console.log(`Valor total em estoque: R$ ${totalValor.toFixed(2)}`);
    }
    
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await client.end();
  }
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function main() {
  console.log('🏪 SISTEMA DE GERENCIAMENTO DE LOJA\n');
  
  console.log('--- Adicionando Clientes ---');
  await adicionarCliente('éric Martis', 'ericmartis@email.com', '11679999999');
  await adicionarCliente('Marla Santos', 'marla@email.com', '11988888888');
  await adicionarCliente('Pedro teliveira', 'pedroteliveira@email.com', '11998777777');
  
  await listarClientes();
  
  console.log('\n--- Adicionando Produtos ---');
  await adicionarProduto('Notebook Dell', 3500.00, 5);
  await adicionarProduto('Mouse Logitech', 80.00, 25);
  await adicionarProduto('Teclado Mecânico', 350.00, 10);
  await adicionarProduto('Monitor LG 24"', 800.00, 8);
  
  await listarProdutos();
  
  console.log('\n✅ Operações concluídas!');
}

main();
