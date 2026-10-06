const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Robson', 'Desktop', 'Codigos', 'ArteBurgueria', 'src', 'components', 'admin', 'CozinhaKanban.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

// Fix "ComeÃ§ar Preparo"
content = content.replace(/ComeÃ§ar Preparo/g, 'Começar Preparo');

// Check for other potential encoding issues in the same file
content = content.replace(/Finalizar \(Pronto\)/g, 'Finalizar (Pronto)');
content = content.replace(/Despachar \(Entregador\)/g, 'Despachar (Entregador)');
content = content.replace(/AÃ§Ã£o/g, 'Ação');
content = content.replace(/A\u00E7\u00E3o/g, 'Ação');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('CozinhaKanban.tsx encoding fixed!');
