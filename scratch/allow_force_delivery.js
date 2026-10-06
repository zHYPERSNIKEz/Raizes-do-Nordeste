const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Robson', 'Desktop', 'Codigos', 'ArteBurgueria', 'src', 'components', 'entregador', 'EntregadorPainelClient.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

// The current code has:
/*
        {['NA_FILA', 'PREPARANDO'].includes(pedido.status) ? (
          <Button 
            className="w-full bg-slate-100 text-slate-400 font-bold h-12 text-lg cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
            disabled
          >
            <Loader2 className="mr-2 animate-spin" size={18} /> Preparando...
          </Button>
        ) : pedido.status === 'PRONTO' ? (
*/

// I need to change the first button to allow the driver to mark it as dispatched, maybe with a different style or just let it be a functional button.

content = content.replace(
  `{['NA_FILA', 'PREPARANDO'].includes(pedido.status) ? (
          <Button 
            className="w-full bg-slate-100 text-slate-400 font-bold h-12 text-lg cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
            disabled
          >
            <Loader2 className="mr-2 animate-spin" size={18} /> Preparando...
          </Button>
        ) : pedido.status === 'PRONTO' ? (`,
  `{['NA_FILA', 'PREPARANDO'].includes(pedido.status) ? (
          <Button 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 text-lg"
            disabled={loading === pedido.id}
            onClick={() => handleMudarStatus(pedido.id, 'DESPACHADO')}
          >
            {loading === pedido.id ? <Loader2 className="animate-spin" /> : <><Bike className="mr-2" /> Forçar Saída (Na Cozinha)</>}
          </Button>
        ) : pedido.status === 'PRONTO' ? (`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Client component updated to allow forcing delivery!');
