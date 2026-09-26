'use server'

import { GoogleGenAI, Type, Schema } from '@google/genai'

export async function analisarCardapioImagem(images: { data: string, mimeType: string }[]) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const prompt = `Você é um assistente especializado em extrair dados de cardápios de restaurantes.
Analise as imagens em anexo e extraia todos os produtos e grupos de complementos/adicionais listados.
Regras:
1. Agrupe os produtos principais por categorias óbvias (ex: Hambúrguer Bovino, Bebidas, Combos/Trios, Sobremesas).
2. TUDO que for seção de "Adicionais", "Acrescente ao seu pedido" ou "Acompanhamentos" NÃO DEVE ser cadastrado como produto normal, mas sim na lista de 'grupos_complementos' (onde max_escolhas deve ser um número alto, ex: 10, e min_escolhas 0, a menos que especificado).
3. Leia atentamente os nomes, descrições (ingredientes) e preços de cada item.`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        categorias: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nome: { type: Type.STRING, description: "Nome da categoria" },
              produtos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nome: { type: Type.STRING },
                    descricao: { type: Type.STRING, nullable: true },
                    preco: { type: Type.NUMBER, description: "Preço do produto em número decimal" }
                  },
                  required: ["nome", "preco"]
                }
              }
            },
            required: ["nome", "produtos"]
          }
        },
        grupos_complementos: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nome: { type: Type.STRING, description: "Nome do grupo, ex: Escolha seu Pão" },
              obrigatorio: { type: Type.BOOLEAN },
              max_escolhas: { type: Type.INTEGER },
              min_escolhas: { type: Type.INTEGER },
              itens: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nome: { type: Type.STRING },
                    preco: { type: Type.NUMBER, description: "Preço adicional. 0 se for grátis.", nullable: true }
                  },
                  required: ["nome"]
                }
              }
            },
            required: ["nome", "itens"]
          }
        }
      },
      required: ["categorias", "grupos_complementos"]
    }

    const MAX_RETRIES = 3;
    let attempt = 0;
    let lastError: any;

    while (attempt < MAX_RETRIES) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              role: 'user',
              parts: [
                ...images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } })),
                { text: prompt }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: schema
          }
        });

        const text = response.text;
        if (!text) {
          throw new Error("Resposta da IA veio vazia.");
        }

        const data = JSON.parse(text);
        return { success: true, data };
      } catch (err: any) {
        lastError = err;
        console.error(`Tentativa ${attempt + 1} falhou:`, err.message || err);
        attempt++;
        
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error("Erro final no Gemini:", error);
    let errorMessage = error.message || 'Falha ao analisar a imagem';
    
    if (errorMessage.includes('{')) {
      try {
        const parsed = JSON.parse(errorMessage.substring(errorMessage.indexOf('{')));
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      } catch (e) {
      }
    }

    return { success: false, error: errorMessage };
  }
}

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarDadosImportados(lojaId: string, dados: any) {
  try {
    const supabase = await createClient()

    const { grupos_complementos, categorias } = dados
    if (grupos_complementos && grupos_complementos.length > 0) {
      for (const g of grupos_complementos) {
        const { data: grupoData, error: gError } = await supabase.from('complemento_grupos').insert({
          loja_id: lojaId,
          nome: g.nome,
          obrigatorio: g.obrigatorio || false,
          min_escolhas: g.min_escolhas || 0,
          max_escolhas: g.max_escolhas || 1
        }).select().single()

        if (gError) throw new Error("Erro ao salvar grupo: " + gError.message)
        
        if (g.itens && g.itens.length > 0) {
          const itensToInsert = g.itens.map((i: any, index: number) => ({
            grupo_id: grupoData.id,
            nome: i.nome,
            preco: i.preco || 0,
            ordem: index
          }))
          const { error: iError } = await supabase.from('complemento_itens').insert(itensToInsert)
          if (iError) throw new Error("Erro ao salvar itens do grupo: " + iError.message)
        }
      }
    }

    if (categorias && categorias.length > 0) {
      for (const cat of categorias) {
        if (!cat.produtos) continue;
        const produtosToInsert = cat.produtos.map((p: any) => ({
          loja_id: lojaId,
          nome: p.nome,
          descricao: p.descricao || '',
          preco: p.preco || 0,
          categoria: cat.nome,
          ativo: true
        }))
        const { error: pError } = await supabase.from('produtos').insert(produtosToInsert)
        if (pError) throw new Error("Erro ao salvar produtos: " + pError.message)
      }
    }

    revalidatePath('/admin/produtos')
    revalidatePath('/admin/complementos')
    revalidatePath('/')
    
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
