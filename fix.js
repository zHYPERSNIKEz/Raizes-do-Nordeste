const fs = require('fs');
const file = 'src/components/admin/ProdutosTableClient.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Filter lines that contain literal backslash + dollar sign
lines = lines.filter(line => !line.includes('\\${'));

fs.writeFileSync(file, lines.join('\n'));

