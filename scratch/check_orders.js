require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkOrders() {
  const { data: lojas } = await supabase.from('lojas').select('id, nome');
  console.log("LOJAS:", lojas);

  const { data: pedidos, error } = await supabase.from('pedidos').select('id, numero_pedido, status, tipo_consumo, loja_id, cliente_nome');
  console.log("PEDIDOS NA FILA/PREPARANDO:");
  console.log(pedidos.filter(p => ['NA_FILA', 'PREPARANDO'].includes(p.status)));
}

checkOrders();
