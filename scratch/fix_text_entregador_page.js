const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Robson', 'Desktop', 'Codigos', 'ArteBurgueria', 'src', 'app', '(entregador)', 'entregador', 'page.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/Voc no tem permisso/g, 'Você não tem permissão');
content = content.replace(/Loja no configurada/g, 'Loja não configurada');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed page text encodings!');
