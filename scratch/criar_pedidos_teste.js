require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function criarPedidos() {
  const loja_id = '11111111-1111-1111-1111-111111111111';
  
  // Dados dos produtos
  const produto1 = { id: 'af3e65e0-7adc-4dda-b4b4-80219d61d926', nome: '01 ARTE DUPLO', preco: 15.5 };
  const produto2 = { id: '73fa4250-2d13-4e8e-ba00-b1c82d78a8a1', nome: '02 ARTE SUPER', preco: 12.5 };
  const produto3 = { id: '17a48393-97a6-4a75-9f9d-af113359a9c9', nome: '03 ARTE BACON', preco: 10.5 };
  
  // Cliente 1
  const cliente1 = {
    user_id: '5f758bfd-324e-4e27-b83c-c04a06c9557d',
    nome: 'Carlos Souza (Simulado)',
    telefone: '(11) 99999-1111',
    endereco: { rua: 'Rua das Flores', numero: '123', bairro: 'Centro', complemento: 'Apto 42', telefone: '(11) 99999-1111' },
    forma_pagamento: 'PIX'
  };

  // Cliente 2
  const cliente2 = {
    user_id: '468bcb99-151e-4500-8b96-8e14ecc15f1f',
    nome: 'Maria Oliveira (Simulado)',
    telefone: '(11) 98888-2222',
    endereco: { rua: 'Av. Paulista', numero: '1000', bairro: 'Bela Vista', complemento: '', telefone: '(11) 98888-2222' },
    forma_pagamento: 'CARTAO_CREDITO'
  };

  try {
    // === PEDIDO 1 ===
    console.log('Criando Pedido 1...');
    const total1 = (produto1.preco * 2) + (produto3.preco * 1);
    
    const { data: pedido1, error: errP1 } = await supabase
      .from('pedidos')
      .insert({
        loja_id,
        user_id: cliente1.user_id,
        cliente_nome: cliente1.nome,
        telefone: cliente1.telefone,
        tipo_consumo: 'DELIVERY',
        endereco: cliente1.endereco,
        status: 'NA_FILA',
        total: total1,
        forma_pagamento: cliente1.forma_pagamento,
        pago: false,
      })
      .select()
      .single();

    if (errP1) throw errP1;

    const { error: errI1 } = await supabase
      .from('itens_pedido')
      .insert([
        {
          pedido_id: pedido1.id,
          produto_id: produto1.id,
          quantidade: 2,
          preco_unitario: produto1.preco,
          observacao: 'Sem cebola'
        },
        {
          pedido_id: pedido1.id,
          produto_id: produto3.id,
          quantidade: 1,
          preco_unitario: produto3.preco,
          observacao: null
        }
      ]);
      
    if (errI1) throw errI1;
    console.log(`Pedido 1 criado com sucesso! ID: ${pedido1.id}`);


    // === PEDIDO 2 ===
    console.log('Criando Pedido 2...');
    const total2 = (produto2.preco * 1);
    
    const { data: pedido2, error: errP2 } = await supabase
      .from('pedidos')
      .insert({
        loja_id,
        user_id: cliente2.user_id,
        cliente_nome: cliente2.nome,
        telefone: cliente2.telefone,
        tipo_consumo: 'DELIVERY',
        endereco: cliente2.endereco,
        status: 'NA_FILA',
        total: total2,
        forma_pagamento: cliente2.forma_pagamento,
        pago: false,
      })
      .select()
      .single();

    if (errP2) throw errP2;

    const { error: errI2 } = await supabase
      .from('itens_pedido')
      .insert([
        {
          pedido_id: pedido2.id,
          produto_id: produto2.id,
          quantidade: 1,
          preco_unitario: produto2.preco,
          observacao: 'Ponto da carne: bem passado'
        }
      ]);
      
    if (errI2) throw errI2;
    console.log(`Pedido 2 criado com sucesso! ID: ${pedido2.id}`);

  } catch (error) {
    console.error('Erro ao criar pedidos:', error);
  }
}

criarPedidos();

