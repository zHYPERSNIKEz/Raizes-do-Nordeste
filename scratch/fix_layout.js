const fs = require('fs');

let code = fs.readFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/app/(admin)/layout.tsx', 'utf8');

code = code.replace(
  /      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col">\s*<div className="p-6 font-black text-xl text-brand border-b border-slate-800">\s*/,
  ''
);

fs.writeFileSync('C:/Users/Robson/Desktop/Codigos/ArteBurgueria/src/app/(admin)/layout.tsx', code, 'utf8');

