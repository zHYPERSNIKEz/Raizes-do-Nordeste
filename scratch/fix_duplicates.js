const fs = require('fs');

function removeDuplicates(filePath, badBlock) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(badBlock, '');
  fs.writeFileSync(filePath, code, 'utf8');
}

// 1. ProdutosTableClient.tsx
let prodBadBlock = `      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">\n`;
removeDuplicates('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/ProdutosTableClient.tsx', prodBadBlock);

// 2. GestaoPedidosClient.tsx
let pedBadBlock = `        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">\n`;
removeDuplicates('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/components/admin/GestaoPedidosClient.tsx', pedBadBlock);

