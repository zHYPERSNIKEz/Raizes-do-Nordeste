import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx > -1) {
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

const NOVOS_PRODUTOS = [
  // ================= PRATOS PRINCIPAIS =================
  {
    nome: 'Baião de Dois Completo da Casa',
    descricao:
      'Arroz misturado com feijão de corda, carne de sol desfiada na manteiga de garrafa, queijo coalho assado, bacon crocante, coentro e macaxeira cozida.',
    preco: 48.9,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Coentro', 'Cebola Roxa', 'Bacon', 'Queijo Coalho'],
    adicionais: [
      { nome: 'Queijo Coalho Extra', preco: 8.0 },
      { nome: 'Carne de Sol Extra (100g)', preco: 14.0 },
      { nome: 'Ovo Caipira Estrelado', preco: 4.5 },
    ],
  },
  {
    nome: 'Carne de Sol na Nata com Macaxeira',
    descricao:
      'Tiras macias de carne de sol salteadas na manteiga de garrafa e finalizadas em molho cremoso de nata fresca com cebola roxa. Acompanha arroz branco e macaxeira dourada.',
    preco: 58.9,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Cebola Roxa', 'Cheiro-Verde', 'Molho de Nata'],
    adicionais: [
      { nome: 'Porção Extra de Macaxeira', preco: 10.0 },
      { nome: 'Farofa de Cuscuz', preco: 7.0 },
    ],
  },
  {
    nome: 'Escondidinho de Carne Seca Gratinado',
    descricao:
      'Purê aveludado de macaxeira com manteiga de garrafa, recheado com carne seca desfiada refogada no alho e cebola, coberto com queijo coalho e requeijão gratinados.',
    preco: 46.0,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Cebola', 'Cheiro-Verde', 'Requeijão do Norte'],
    adicionais: [
      { nome: 'Arroz Branco (Acompanhamento)', preco: 8.0 },
      { nome: 'Queijo Coalho Gratinado Extra', preco: 7.5 },
    ],
  },
  {
    nome: 'Rubacão Sertanejo Tradicional',
    descricao:
      'Clássico paraibano cremoso feito com feijão verde, arroz da terra, charque desfiado, linguiça artesanal, nata fresca e cubos de queijo coalho.',
    preco: 49.9,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Coentro', 'Cebola Roxa', 'Linguiça Artesanal'],
    adicionais: [
      { nome: 'Carne de Sol Acebolada (120g)', preco: 15.0 },
      { nome: 'Banana da Terra Grelhada', preco: 6.0 },
    ],
  },
  {
    nome: 'Arroz de Leite com Carne de Sol e Coalho',
    descricao:
      'Arroz cozido lentamente no leite fresco e nata até ficar super cremoso, finalizado com queijo coalho derretido e acompanhado de carne de sol na brasa.',
    preco: 52.0,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Cebola na Carne', 'Cheiro-Verde'],
    adicionais: [
      { nome: 'Paçoca de Carne de Sol', preco: 9.0 },
      { nome: 'Macaxeira Frita', preco: 10.0 },
    ],
  },
  {
    nome: 'Bobó de Camarão Nordestino',
    descricao:
      'Camarões selecionados flambados e envolvidos em creme artesanal de macaxeira com leite de coco natural, azeite de dendê leve e pimentões coloridos. Acompanha arroz branco e farofa de dendê.',
    preco: 68.9,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Coentro', 'Pimentão', 'Azeite de Dendê'],
    adicionais: [
      { nome: 'Camarões Extras (100g)', preco: 22.0 },
      { nome: 'Porção de Arroz Extra', preco: 8.0 },
    ],
  },
  {
    nome: 'Moqueca de Peixe ao Leite de Coco',
    descricao:
      'Postas de peixe branco fresco cozidas na panela de barro com leite de coco, tomates maduros, pimentões, cebola e coentro fresco. Acompanha arroz, pirão e farofa.',
    preco: 64.9,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Coentro', 'Pimentão', 'Cebola'],
    adicionais: [
      { nome: 'Pirão Extra', preco: 9.0 },
      { nome: 'Camarão ao Alho e Óleo', preco: 19.0 },
    ],
  },
  {
    nome: 'Galinhada Caipira do Sertão',
    descricao:
      'Frango caipira cozido lentamente com tempero nordestino, açafrão da terra, milho verde, pimentinha de cheiro e arroz soltinho. Acompanha feijão verde e farofa.',
    preco: 44.9,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Coentro', 'Pimenta de Cheiro', 'Milho Verde'],
    adicionais: [
      { nome: 'Ovo Caipira Frito', preco: 4.5 },
      { nome: 'Vinagrete da Casa', preco: 5.0 },
    ],
  },
  {
    nome: 'Cuscuz Recheado Lampião & Maria Bonita',
    descricao:
      'Cuscuz de milho flocão fofinho no vapor, recheado com carne de sol desfiada na nata, queijo coalho na chapa, banana da terra frita e requeijão.',
    preco: 34.9,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Banana da Terra', 'Requeijão', 'Coentro'],
    adicionais: [
      { nome: 'Ovo Estrelado na Manteiga de Garrafa', preco: 4.5 },
      { nome: 'Queijo Coalho Extra', preco: 7.5 },
    ],
  },
  {
    nome: 'Favada Pernambucana com Charque',
    descricao:
      'Fava rajada cozida lentamente com charque em cubos, calabresa defumada, bacon e tempero regional. Acompanha arroz branco, farofa na manteiga e vinagrete.',
    preco: 45.0,
    categoria: 'Pratos Principais',
    imagem_url:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Coentro', 'Calabresa', 'Bacon'],
    adicionais: [
      { nome: 'Torresmo Crocante', preco: 12.0 },
      { nome: 'Farofa de Manteiga Extra', preco: 6.0 },
    ],
  },

  // ================= CARNES DE SOL & ASSADOS =================
  {
    nome: 'Picanha de Sol na Manteiga de Garrafa (Serve 2)',
    descricao:
      'Generosa picanha de sol grelhada na brasa, regada na manteiga de garrafa com alho dourado. Acompanha baião de dois, macaxeira frita, paçoca de carne e vinagrete.',
    preco: 119.9,
    categoria: 'Carnes de Sol & Assados',
    imagem_url:
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Alho Dourado', 'Cebola Roxa', 'Vinagrete'],
    adicionais: [
      { nome: 'Queijo Coalho na Brasa', preco: 14.0 },
      { nome: 'Porção Extra de Baião', preco: 16.0 },
    ],
  },
  {
    nome: 'Carne de Sol de Filé com Queijo Coalho Assado',
    descricao:
      'Corte nobre de filé de sol selado na chapa com cebola roxa e coberto com queijo coalho tostado. Acompanha feijão verde cremoso, arroz branco e batata doce ou macaxeira.',
    preco: 66.9,
    categoria: 'Carnes de Sol & Assados',
    imagem_url:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Cebola Roxa', 'Manteiga de Garrafa'],
    adicionais: [
      { nome: 'Paçoca Sertaneja no Pilão', preco: 9.0 },
      { nome: 'Banana à Milanesa', preco: 7.0 },
    ],
  },
  {
    nome: 'Cupim Assado Lento na Manteiga de Garrafa',
    descricao:
      'Cupim bovino assado por 8 horas até desmanchar no garfo, finalizado na manteiga de garrafa. Acompanha arroz de alho, feijão tropeiro nordestino e macaxeira.',
    preco: 62.9,
    categoria: 'Carnes de Sol & Assados',
    imagem_url:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Alho Crocante', 'Cheiro-Verde'],
    adicionais: [
      { nome: 'Queijo Coalho Derretido', preco: 8.5 },
      { nome: 'Farofa Crocante de Bacon', preco: 7.0 },
    ],
  },
  {
    nome: 'Costelinha Suína ao Barbecue de Rapadura',
    descricao:
      'Costelinha suína marinada em especiarias e assada lentamente, glaceada com molho artesanal de rapadura e toque cítrico. Acompanha batata rústica e farofa.',
    preco: 59.9,
    categoria: 'Carnes de Sol & Assados',
    imagem_url:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Molho de Rapadura', 'Gergelim Torrado'],
    adicionais: [
      { nome: 'Molho de Rapadura Extra', preco: 5.0 },
      { nome: 'Porção de Arroz Branco', preco: 8.0 },
    ],
  },
  {
    nome: 'Carneiro Guisado ao Molho Sertanejo',
    descricao:
      'Pernil de cordeiro cozido lentamente com hortelã miúda, pimenta de cheiro, legumes e vinho tinto suave. Acompanha cuscuz amanteigado, arroz e feijão verde.',
    preco: 64.0,
    categoria: 'Carnes de Sol & Assados',
    imagem_url:
      'https://images.unsplash.com/photo-1514944298352-f4d732142f74?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Hortelã', 'Coentro', 'Pimenta de Cheiro'],
    adicionais: [{ nome: 'Cuscuz Extra na Manteiga', preco: 8.0 }],
  },
  {
    nome: 'Maminha na Brasa com Baião Cremoso',
    descricao:
      'Maminha suculenta assada na brasa com manteiga de ervas e alho. Servida com baião de dois cremoso, vinagrete de feijão verde e farofa crocante.',
    preco: 63.9,
    categoria: 'Carnes de Sol & Assados',
    imagem_url:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Manteiga de Ervas', 'Alho', 'Vinagrete'],
    adicionais: [{ nome: 'Queijo Coalho Grelhado', preco: 8.0 }],
  },

  // ================= PORÇÕES & PETISCOS =================
  {
    nome: 'Dadinhos de Tapioca com Mel de Engenho (12 un)',
    descricao:
      'Cubinhos crocantes por fora e macios por dentro, preparados com tapioca granulada e queijo coalho artesanal. Acompanha geleia de pimenta e mel de engenho.',
    preco: 29.9,
    categoria: 'Porções & Petiscos',
    imagem_url:
      'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Geleia de Pimenta', 'Mel de Engenho'],
    adicionais: [{ nome: 'Porção Extra de Geleia de Pimenta', preco: 4.0 }],
  },
  {
    nome: 'Queijo Coalho Assado na Brasa com Melaço',
    descricao:
      'Três espetos generosos de queijo coalho legítimo dourados na brasa, finalizados com orégano e fio de melaço de cana.',
    preco: 27.9,
    categoria: 'Porções & Petiscos',
    imagem_url:
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Melaço de Cana', 'Orégano'],
    adicionais: [{ nome: 'Mel de Engenho Extra', preco: 3.5 }],
  },
  {
    nome: 'Bolinho de Macaxeira com Carne de Sol (8 un)',
    descricao:
      'Bolinhos artesanais de massa de macaxeira super leve, recheados com carne de sol desfiada e requeijão do norte. Acompanha maionese de coentro.',
    preco: 32.9,
    categoria: 'Porções & Petiscos',
    imagem_url:
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Maionese de Coentro'],
    adicionais: [{ nome: 'Geleia de Pimenta', preco: 4.0 }],
  },
  {
    nome: 'Pastelzinho de Carne Seca com Nata (8 un)',
    descricao:
      'Pastéis de feira crocantes e sequinhos, recheados com carne seca desfiada cremosa na nata e queijo coalho.',
    preco: 31.9,
    categoria: 'Porções & Petiscos',
    imagem_url:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Nata', 'Queijo Coalho', 'Cebolinha'],
    adicionais: [{ nome: 'Vinagrete Apimentado', preco: 4.0 }],
  },
  {
    nome: 'Macaxeira Frita com Queijo Coalho Ralado',
    descricao:
      'Porção generosa de macaxeira cozida no leite e frita até ficar dourada e crocante, finalizada com manteiga de garrafa e chuva de queijo coalho.',
    preco: 25.9,
    categoria: 'Porções & Petiscos',
    imagem_url:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Queijo Coalho Ralado', 'Manteiga de Garrafa'],
    adicionais: [{ nome: 'Carne de Sol Desfiada por Cima', preco: 14.0 }],
  },
  {
    nome: 'Torresmo de Rolo Crocante com Limão Cravo',
    descricao:
      'Barriga suína enrolada e pururucada até atingir crocância máxima por fora e suculência por dentro. Acompanha limão cravo e farofa.',
    preco: 36.9,
    categoria: 'Porções & Petiscos',
    imagem_url:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Limão Cravo', 'Farofa'],
    adicionais: [{ nome: 'Mandioca Cozida na Manteiga', preco: 9.0 }],
  },
  {
    nome: 'Caldinho de Feijão Verde com Charque e Torresmo',
    descricao:
      'Caldinho quente e encorpado de feijão verde batido com temperos da roça, servido com cubinhos de charque frito, torresmo e cheiro-verde.',
    preco: 18.9,
    categoria: 'Porções & Petiscos',
    imagem_url:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Torresmo', 'Charque', 'Coentro', 'Ovo de Codorna'],
    adicionais: [{ nome: 'Torradas no Alho', preco: 4.0 }],
  },
  {
    nome: 'Trio Nordestino na Chapa Quente',
    descricao:
      'Carne de sol em tiras, calabresa artesanal acebolada e cubos de queijo coalho servidos na chapa fumegante com macaxeira frita e farofa de cuscuz.',
    preco: 69.9,
    categoria: 'Porções & Petiscos',
    imagem_url:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Cebola Roxa', 'Calabresa', 'Queijo Coalho'],
    adicionais: [{ nome: 'Pão de Alho na Brasa (2 un)', preco: 9.9 }],
  },

  // ================= BEBIDAS (SUCOS E REFRIGERANTES) =================
  {
    nome: 'Suco Natural de Cajá 500ml',
    descricao:
      'Suco refrescante preparado na hora com polpa selecionada de cajá nordestino, bem gelado.',
    preco: 12.9,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Gelo', 'Açúcar'],
    adicionais: [{ nome: 'Com Leite (Vitamina)', preco: 3.0 }],
  },
  {
    nome: 'Suco Natural de Acerola 500ml',
    descricao:
      'Suco de acerola fresca rico em vitamina C, batido na hora e servido bem gelado.',
    preco: 11.9,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Gelo', 'Açúcar'],
    adicionais: [{ nome: 'Toque de Laranja', preco: 2.5 }],
  },
  {
    nome: 'Suco Cremoso de Graviola 500ml',
    descricao:
      'Suco encorpado e aromático de graviola típica do Nordeste, feito na hora.',
    preco: 13.5,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Gelo', 'Açúcar'],
    adicionais: [{ nome: 'Com Leite Condensado', preco: 3.5 }],
  },
  {
    nome: 'Suco Natural de Caju 500ml',
    descricao:
      'Suco autêntico da fruta do cajuzeiro nordestino, refrescante e levemente adocicado.',
    preco: 12.5,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Gelo', 'Açúcar'],
    adicionais: [],
  },
  {
    nome: 'Suco de Maracujá da Roça 500ml',
    descricao:
      'Suco natural feito com a fruta fresca do maracujá, equilibrado e super refrescante.',
    preco: 12.9,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Gelo', 'Açúcar'],
    adicionais: [],
  },
  {
    nome: 'Jarra de Suco de Abacaxi com Hortelã (1 Litro)',
    descricao:
      'Jarra de 1 litro de suco natural de abacaxi pérola batido com folhas frescas de hortelã. Ideal para compartilhar.',
    preco: 22.9,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Hortelã Fresca', 'Gelo', 'Açúcar'],
    adicionais: [],
  },
  {
    nome: 'Refrigerante de Caju São Geraldo Lata 350ml',
    descricao:
      'O patrimônio do Nordeste! Refrigerante tradicional de caju São Geraldo bem gelado.',
    preco: 7.9,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: [],
    adicionais: [],
  },
  {
    nome: 'Coca-Cola Original Lata 350ml',
    descricao: 'Refrigerante Coca-Cola tradicional em lata 350ml trincando de gelada.',
    preco: 6.9,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: [],
    adicionais: [],
  },
  {
    nome: 'Coca-Cola Zero Açúcar Lata 350ml',
    descricao: 'Refrigerante Coca-Cola Zero Açúcar lata 350ml bem gelada.',
    preco: 6.9,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: [],
    adicionais: [],
  },
  {
    nome: 'Guaraná Antarctica Lata 350ml',
    descricao: 'Refrigerante Guaraná Antarctica original em lata 350ml.',
    preco: 6.5,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: [],
    adicionais: [],
  },
  {
    nome: 'Cajuína Tradicional Cristalina 500ml',
    descricao:
      'Bebida típica nordestina 100% natural feita do suco clarificado do caju e caramelizada no próprio açúcar da fruta (sem álcool e sem gás).',
    preco: 14.9,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: [],
    adicionais: [],
  },
  {
    nome: 'Água de Coco Natural Gelada 500ml',
    descricao: 'Água de coco 100% natural extraída do coco verde, servida bem gelada.',
    preco: 9.9,
    categoria: 'Bebidas',
    imagem_url:
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: [],
    adicionais: [],
  },

  // ================= SOBREMESAS REGIONAIS & DOCES =================
  {
    nome: 'Cartola Pernambucana Tradicional',
    descricao:
      'Banana da terra madura dourada na manteiga de garrafa, coberta com fatia generosa de queijo manteiga derretido e polvilhada com açúcar e canela.',
    preco: 21.9,
    categoria: 'Sobremesas Regionais',
    imagem_url:
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Canela em Pó', 'Queijo Manteiga'],
    adicionais: [{ nome: 'Bola de Sorvete de Creme', preco: 6.5 }],
  },
  {
    nome: 'Bolo de Rolo Pernambucano com Sorvete',
    descricao:
      'Fatias finíssimas de massa leve enroladas com goiabada cascão artesanal derretida, servidas mornas com uma bola de sorvete de creme.',
    preco: 23.9,
    categoria: 'Sobremesas Regionais',
    imagem_url:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Sorvete de Creme', 'Calda de Goiabada'],
    adicionais: [{ nome: 'Fatia Extra de Queijo do Reino', preco: 8.0 }],
  },
  {
    nome: 'Pudim de Leite com Calda de Rapadura',
    descricao:
      'Pudim de leite condensado lisinho e super cremoso, finalizado com calda especial de caramelo de rapadura do Cariri.',
    preco: 16.9,
    categoria: 'Sobremesas Regionais',
    imagem_url:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Calda de Rapadura'],
    adicionais: [],
  },
  {
    nome: 'Cocada Cremosa de Forno com Sorvete',
    descricao:
      'Cocada de coco fresco ralada grossa e assada no forno até dourar por cima e ficar cremosa por dentro, acompanhada de sorvete de tapioca.',
    preco: 22.9,
    categoria: 'Sobremesas Regionais',
    imagem_url:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Sorvete', 'Coco Queimado Ralado'],
    adicionais: [{ nome: 'Calda de Doce de Leite', preco: 4.0 }],
  },
  {
    nome: 'Mousse Aerada de Maracujá com Calda da Fruta',
    descricao:
      'Mousse cremosa e aerada de maracujá natural, finalizada com redução artesanal de polpa e sementes crocantes de maracujá.',
    preco: 15.9,
    categoria: 'Sobremesas Regionais',
    imagem_url:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Calda com Sementes de Maracujá'],
    adicionais: [{ nome: 'Raspas de Chocolate Meio Amargo', preco: 3.5 }],
  },
  {
    nome: 'Petit Gâteau de Doce de Leite Sertanejo',
    descricao:
      'Bolinho quente de doce de leite artesanal com interior cremoso, servido com sorvete de nata e farofinha crocante de castanha de caju.',
    preco: 25.9,
    categoria: 'Sobremesas Regionais',
    imagem_url:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Castanha de Caju', 'Sorvete de Nata'],
    adicionais: [],
  },
  {
    nome: 'Taça Delícia de Abacaxi Nordestina',
    descricao:
      'Sobremesa gelada tradicional com camadas de doce caseiro de abacaxi em cubos, creme branco aveludado e merengue maçaricado com castanha de caju.',
    preco: 18.9,
    categoria: 'Sobremesas Regionais',
    imagem_url:
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Castanha de Caju'],
    adicionais: [],
  },
  {
    nome: 'Doce de Leite Talhado Caseiro com Queijo Coalho',
    descricao:
      'Clássico doce de leite em pedaços macios feito no tacho de cobre com especiarias, acompanhado de lascas de queijo coalho.',
    preco: 17.5,
    categoria: 'Sobremesas Regionais',
    imagem_url:
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    ingredientes_base: ['Queijo Coalho'],
    adicionais: [],
  },
]

async function main() {
  console.log('1. Autenticando como admin@admin.com...')
  const authRes = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'admin@admin.com', password: '123456' }),
    }
  )

  if (authRes.ok) {
    const authJson = await authRes.json()
    console.log('Autenticado como admin@admin.com! User ID:', authJson.user?.id)
  } else {
    console.log('Seguindo com Service Role Key para cadastro dos produtos...')
  }

  // 2. Buscar loja
  const lojasRes = await fetch(`${supabaseUrl}/rest/v1/lojas?select=*&limit=1`, {
    headers,
  })
  const lojas = await lojasRes.json()
  const loja = lojas?.[0]
  if (!loja) throw new Error('Nenhuma loja encontrada!')
  console.log(`2. Loja ativa: ${loja.nome} (${loja.id})`)

  // Garantir loja aberta
  await fetch(`${supabaseUrl}/rest/v1/lojas?id=eq.${loja.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ aberta: true, em_pausa: false }),
  })

  // 3. Buscar produtos existentes
  const existRes = await fetch(
    `${supabaseUrl}/rest/v1/produtos?loja_id=eq.${loja.id}&select=id,nome,categoria`,
    { headers }
  )
  const existentes = await existRes.json()
  const nomesExistentes = new Set(
    (existentes || []).map((p) => p.nome.trim().toLowerCase())
  )

  const paraInserir = NOVOS_PRODUTOS.filter(
    (p) => !nomesExistentes.has(p.nome.trim().toLowerCase())
  ).map((p) => ({
    ...p,
    loja_id: loja.id,
    ativo: true,
  }))

  console.log(
    `3. Produtos já existentes: ${existentes.length} | Novos para cadastrar: ${paraInserir.length}`
  )

  if (paraInserir.length > 0) {
    const insRes = await fetch(`${supabaseUrl}/rest/v1/produtos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paraInserir),
    })
    if (!insRes.ok) {
      const errText = await insRes.text()
      throw new Error('Erro ao inserir produtos: ' + errText)
    }
    const inseridos = await insRes.json()
    console.log(`4. Sucesso! ${inseridos.length} produtos cadastrados com imagens!`)
  }

  // Resumo final
  const finalRes = await fetch(
    `${supabaseUrl}/rest/v1/produtos?loja_id=eq.${loja.id}&ativo=eq.true&select=id,nome,categoria,preco`,
    { headers }
  )
  const todos = await finalRes.json()
  const resumo = {}
  for (const p of todos) {
    resumo[p.categoria] = (resumo[p.categoria] || 0) + 1
  }
  console.log('Total de produtos ativos no cardápio:', todos.length)
  console.log('Por categoria:', resumo)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

