const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Robson', 'Desktop', 'Codigos', 'ArteBurgueria', 'src', 'components', 'entregador', 'EntregadorPainelClient.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

// The current code has:
/*
          if (payload.eventType === 'UPDATE') {
*/

content = content.replace(
  `if (payload.eventType === 'UPDATE') {`,
  `if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Client component updated to handle INSERT!');
