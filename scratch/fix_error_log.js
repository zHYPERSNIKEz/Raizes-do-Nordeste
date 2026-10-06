const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Robson', 'Desktop', 'Codigos', 'ArteBurgueria', 'src', 'app', '(entregador)', 'entregador', 'page.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

// The current code has:
/*
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select(`
*/

content = content.replace(
  `const { data: pedidos } = await supabase`,
  `const { data: pedidos, error: pedidosError } = await supabase`
);

content = content.replace(
  `return (
    <main className="p-4 md:p-6 pb-24 min-h-screen">`,
  `if (pedidosError) console.error("ERRO AO BUSCAR PEDIDOS NO ENTREGADOR:", pedidosError);
  
  return (
    <main className="p-4 md:p-6 pb-24 min-h-screen">`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Added error logging to page.tsx!');
