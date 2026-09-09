# Guia de Estilos e Design System - Arte Hamburgueria

Este documento consolida todas as definições visuais do SaaS para a hamburgueria, pronto para ser implementado na sua arquitetura front-end (React + Tailwind CSS + Shadcn/UI).

---

## 1. Tipografia

Como a logo já possui fontes bem desenhadas e marcantes, o sistema deve utilizar uma tipografia limpa, geométrica e altamente legível para equilibrar o visual, especialmente em telas cheias de informações como o caixa e a cozinha.

* **Fonte Principal (UI, Textos, Preços):** `Inter` ou `Poppins`.
  * *Por que?* Elas possuem excelente legibilidade em tamanhos pequenos (mobile) e suportam muito bem os pesos da fonte (Bold para preços, Regular para descrições).
* **Importação via Google Fonts (exemplo):**
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  ```

---

## 2. Paleta de Cores

As cores foram baseadas na logo (Azul profundo, Laranja e Vermelho do hambúrguer) e divididas por função no sistema.

### Cores de Identidade (Base & Dark Mode)
* **Brand Blue (Azul Escuro):** Usado no fundo do painel administrativo, barras laterais e cabeçalhos.
  * *Tailwind:* `bg-blue-950` (`#172554`) ou `bg-slate-900` (`#0f172a`) para uma pegada mais acinzentada no painel.
* **Fundo App Cliente (Claro):** Off-white para destacar as fotos dos hambúrgueres.
  * *Tailwind:* `bg-slate-50` (`#f8fafc`).

### Cores de Ação (Gatilhos de Conversão)
* **Ação Principal (Laranja):** Botões como "Adicionar ao Carrinho", "Pagar Pix" e "Mudar Status".
  * *Tailwind:* `bg-orange-600` (`#ea580c`).
  * *Hover:* `bg-orange-700` (`#c2410c`).
* **Ação Secundária / Alertas (Vermelho):** Excluir item, alertas de erro.
  * *Tailwind:* `bg-red-600` (`#dc2626`).

### Cores de Status (Gestão de Pedidos)
* **Na Fila:** `text-blue-400` / `bg-blue-400/10`
* **Preparando:** `text-amber-400` / `bg-amber-400/10`
* **Saiu para Entrega / Pronto:** `text-emerald-400` / `bg-emerald-400/10`

---

## 3. Estrutura de Arquivos (Código)

Para facilitar a integração, aqui está a sugestão de como mapear essas cores nos arquivos de configuração do seu projeto.

### Exemplo de `tailwind.config.ts`
Estendendo as cores padrão para incluir os tons exatos da hamburgueria:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#172554', // blue-950
          dark: '#0f172a', // slate-900
          light: '#1e3a8a', // blue-900
        },
        action: {
          DEFAULT: '#ea580c', // orange-600
          hover: '#c2410c', // orange-700
        },
      }
    },
  },
  plugins: [],
}
export default config
```

### Exemplo de `globals.css` (Base com variáveis Shadcn/UI)
Se estiver utilizando a estrutura de variáveis CSS, você pode mapear a cor primária (botões) diretamente para o laranja da marca e o fundo do Dark Mode para o azul/slate escuro:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%; /* slate-50 */
    --foreground: 222.2 84% 4.9%;
    
    /* Laranja do Hambúrguer para botões primários */
    --primary: 24.6 95% 53.1%; /* orange-600 */
    --primary-foreground: 210 40% 98%;
  }

  .dark {
    /* Fundo azul escuro adaptado para o painel */
    --background: 226 58% 10%; /* blue-950 adaptado */
    --foreground: 210 40% 98%;
    
    --card: 222.2 84% 4.9%; /* slate-950/900 */
    --card-foreground: 210 40% 98%;
    
    --primary: 24.6 95% 53.1%;
    --primary-foreground: 222.2 47.4% 11.2%;
  }
}
```

## 4. Próximos Passos
Com este arquivo salvo, o front-end já tem suas bases visuais sólidas. A próxima etapa é definir a arquitetura (banco de dados e fluxos) para criar os módulos isolados.
