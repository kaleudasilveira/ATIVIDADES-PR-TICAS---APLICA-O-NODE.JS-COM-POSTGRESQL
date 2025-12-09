const { Client } = require('pg');
require('dotenv').config();

// ==========================
// CONFIGURAÇÃO DO CLIENTE
// ==========================
function criarCliente() {
  return new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  });
}

// ==========================
// VALIDAÇÕES
// ==========================
function validarCliente(nome, email) {
  const erros = [];
  if (!nome || nome.trim() === '') erros.push('Nome é obrigatório');
  else if (nome.length < 3) erros.push('Nome deve ter pelo menos 3 caracteres');
  if (!email || email.trim() === '') erros.push('Email é obrigatório');
  else if (!email.includes('@')) erros.push('Email inválido');
  return erros;
}

function validarProduto(nome, preco) {
  const erros = [];
  if (!nome || nome.trim() === '') erros.push('Nome é obrigatório');
  if (!preco || preco <= 0) erros.push('Preço deve ser maior que zero');
  return erros;
}

// ==========================
// CLIENTE
// ==========================
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
    const res = await client.query(
      'INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING id',
      [nome, email, telefone]
    );
    console.log(`✅ Cliente "${nome}" adicionado! ID: ${res.rows[0].id}`);
    return true;
  } catch (erro) {
    if (erro.message.includes('duplicate key')) console.error('❌ Email já cadastrado');
    else console.error('❌ Erro:', erro.message);
    return false;
  } finally {
    await client.end();
  }
}

async function listarClientes() {
  const client = criarCliente();
  try {
    await client.connect();
    const res = await client.query('SELECT id, nome, email, telefone FROM clientes ORDER BY nome');
    console.log('\n📋 CLIENTES CADASTRADOS');
    console.log('='.repeat(50));
    if (res.rows.length === 0) console.log('Nenhum cliente cadastrado');
    else {
      res.rows.forEach(c => console.log(`[${c.id}] ${c.nome} | ${c.email} | ${c.telefone || '-'}`));
      console.log(`Total: ${res.rows.length} cliente(s)`);
    }
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await client.end();
  }
}

async function buscarCliente(termo) {
  if (!termo || termo.trim() === '') {
    console.error('❌ Termo inválido');
    return [];
  }
  const client = criarCliente();
  try {
    await client.connect();
    const res = await client.query(
      'SELECT id, nome, email, telefone FROM clientes WHERE nome ILIKE $1 OR email ILIKE $1 ORDER BY nome',
      [`%${termo}%`]
    );
    return res.rows;
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    return [];
  } finally {
    await client.end();
  }
}

async function excluirCliente(clienteId) {
  const client = criarCliente();
  try {
    await client.connect();
    const resCliente = await client.query('SELECT id FROM clientes WHERE id = $1', [clienteId]);
    if (resCliente.rows.length === 0) {
      console.error('❌ Cliente não encontrado');
      return false;
    }
    const resPedidos = await client.query('SELECT id FROM pedidos WHERE cliente_id = $1', [clienteId]);
    if (resPedidos.rows.length > 0) {
      console.error('❌ Cliente possui pedidos e não pode ser excluído');
      return false;
    }
    await client.query('DELETE FROM clientes WHERE id = $1', [clienteId]);
    console.log(`✅ Cliente ID ${clienteId} excluído`);
    return true;
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    return false;
  } finally {
    await client.end();
  }
}

// ==========================
// PRODUTO
// ==========================
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
    const res = await client.query(
      'INSERT INTO produtos (nome, preco, estoque) VALUES ($1, $2, $3) RETURNING id',
      [nome, preco, estoque]
    );
    console.log(`✅ Produto "${nome}" adicionado! ID: ${res.rows[0].id}`);
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
    const res = await client.query('SELECT id, nome, preco, estoque FROM produtos ORDER BY nome');
    console.log('\n📦 PRODUTOS CADASTRADOS');
    console.log('='.repeat(50));
    if (res.rows.length === 0) console.log('Nenhum produto cadastrado');
    else {
      let totalValor = 0;
      res.rows.forEach(p => {
        const preco = Number(p.preco);
        const estoque = Number(p.estoque);
        totalValor += preco * estoque;
        console.log(`[${p.id}] ${p.nome} | R$ ${preco.toFixed(2)} | Estoque: ${estoque}`);
      });
      console.log(`Total: ${res.rows.length} produto(s)`);
      console.log(`Valor total em estoque: R$ ${totalValor.toFixed(2)}`);
    }
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await client.end();
  }
}

async function atualizarEstoque(produtoId, novaQuantidade) {
  if (novaQuantidade < 0) {
    console.error('❌ Quantidade inválida');
    return false;
  }
  const client = criarCliente();
  try {
    await client.connect();
    const res = await client.query(
      'UPDATE produtos SET estoque = $1 WHERE id = $2 RETURNING id, estoque',
      [novaQuantidade, produtoId]
    );
    if (res.rows.length === 0) {
      console.error('❌ Produto não encontrado');
      return false;
    }
    console.log(`✅ Estoque atualizado! Produto ID: ${res.rows[0].id}, Novo estoque: ${res.rows[0].estoque}`);
    return res.rows[0].estoque;
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    return false;
  } finally {
    await client.end();
  }
}

// ==========================
// PEDIDO
// ==========================
async function criarPedido(clienteId, produtoIds) {
  const client = criarCliente();
  try {
    await client.connect();

    const resCliente = await client.query('SELECT id FROM clientes WHERE id = $1', [clienteId]);
    if (resCliente.rows.length === 0) return console.error('❌ Cliente não encontrado');

    const resProdutos = await client.query('SELECT id, preco FROM produtos WHERE id = ANY($1::int[])', [produtoIds]);
    if (resProdutos.rows.length !== produtoIds.length) return console.error('❌ Alguns produtos não existem');

    const valorTotal = resProdutos.rows.reduce((total, p) => total + Number(p.preco), 0);

    const resPedido = await client.query('INSERT INTO pedidos (cliente_id, valor_total) VALUES ($1, $2) RETURNING id', [clienteId, valorTotal]);
    const pedidoId = resPedido.rows[0].id;

    for (const produto of resProdutos.rows) {
      await client.query('INSERT INTO pedido_produtos (pedido_id, produto_id) VALUES ($1, $2)', [pedidoId, produto.id]);
    }

    console.log(`✅ Pedido criado! ID: ${pedidoId}, Total: R$ ${valorTotal.toFixed(2)}`);
  } catch (erro) {
    console.error('❌ Erro ao criar pedido:', erro.message);
  } finally {
    await client.end();
  }
}

async function relatorioVendas() {
  const client = criarCliente();
  try {
    await client.connect();
    const res = await client.query(`
      SELECT c.id, c.nome, SUM(p.valor_total) AS total_compras
      FROM clientes c
      LEFT JOIN pedidos p ON c.id = p.cliente_id
      GROUP BY c.id, c.nome
      ORDER BY total_compras DESC NULLS LAST
    `);
    console.log('\n📊 RELATÓRIO DE VENDAS POR CLIENTE');
    console.log('='.repeat(50));
    res.rows.forEach(c => {
      const total = c.total_compras ? Number(c.total_compras).toFixed(2) : '0.00';
      console.log(`[${c.id}] ${c.nome} | Total Compras: R$ ${total}`);
    });
  } catch (erro) {
    console.error('❌ Erro ao gerar relatório:', erro.message);
  } finally {
    await client.end();
  }
}

// ==========================
// MAIN - MENU DE TESTE
// ==========================
async function main() {
  console.log('🏪 SISTEMA DE GERENCIAMENTO DE LOJA');

  // Clientes
  await adicionarCliente('Éric Martis', 'eric@email.com', '11679999999');
  await adicionarCliente('Marla Santos', 'marla@email.com', '11988888888');
  await listarClientes();
  const clientesEncontrados = await buscarCliente('Marla');
  console.log('\n🔍 Clientes encontrados por busca:', clientesEncontrados);
  // await excluirCliente(2); // Teste de exclusão

  // Produtos
  await adicionarProduto('Notebook Dell', 3500.00, 5);
  await adicionarProduto('Mouse Logitech', 80.00, 25);
  await listarProdutos();
  await atualizarEstoque(1, 10);

  // Pedidos
  await criarPedido(1, [1, 2]);
  await relatorioVendas();

  console.log('\n✅ Operações concluídas!');
}

main();
