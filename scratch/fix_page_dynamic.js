const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Robson', 'Desktop', 'Codigos', 'ArteBurgueria', 'src', 'app', '(entregador)', 'entregador', 'page.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

if (!content.includes("export const dynamic = 'force-dynamic'")) {
  content = content.replace(
    `import { EntregadorPainelClient } from '@/components/entregador/EntregadorPainelClient'`,
    `import { EntregadorPainelClient } from '@/components/entregador/EntregadorPainelClient'\n\nexport const dynamic = 'force-dynamic'`
  );
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Added force-dynamic to page.tsx');
} else {
  console.log('force-dynamic already present');
}
