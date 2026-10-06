const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Robson', 'Desktop', 'Codigos', 'ArteBurgueria', 'src', 'components', 'entregador', 'EntregadorPainelClient.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

// Fix text strings
content = content.replace(/Com voc no caminho/g, 'Com você no caminho');
content = content.replace(/J Pago/g, 'Já Pago');
content = content.replace(/J\u00E1 Pago/g, 'Já Pago');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed text encodings in Entregador painel!');
