import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  Lock,
  Database,
  Cookie,
  UserCheck,
  Share2,
  Clock,
  Mail,
  ArrowLeft,
} from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidade e LGPD | Raízes do Nordeste',
  description:
    'Política de Privacidade e Proteção de Dados Pessoais em conformidade com a LGPD (Lei nº 13.709/2018).',
}

export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Topo de navegação */}
        <div>
          <Link href="/">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft size={16} /> Voltar para o Cardápio
            </Button>
          </Link>
        </div>

        {/* Cabeçalho */}
        <header className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={16} /> Conformidade LGPD • Lei nº 13.709/2018
          </div>
          <h1 className="font-display text-3xl sm:text-5xl text-primary tracking-tight">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            O restaurante <strong>Raízes do Nordeste</strong> valoriza a sua privacidade e garante a
            transparência no tratamento dos seus dados pessoais. Este documento descreve exatamente
            quais informações coletamos em nossa plataforma de pedidos online, por que as coletamos,
            como são protegidas e como você pode exercer seus direitos previstos na{' '}
            <strong>Lei Geral de Proteção de Dados Pessoais (LGPD — Lei Federal nº 13.709/2018)</strong>.
          </p>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Última atualização: Outubro de 2026
          </p>
        </header>

        {/* 1. Mapeamento dos Dados Coletados */}
        <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Database size={22} />
            <h2 className="text-xl font-bold text-foreground">
              1. Quais Dados Pessoais Coletamos e Onde São Utilizados
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Coletamos apenas os dados estritamente necessários (princípio da minimização, Art. 6º,
            III da LGPD) para viabilizar o cadastro da sua conta, o preparo gastronômico e a entrega
            do seu pedido:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
              <h3 className="font-bold text-sm text-foreground">
                A) Cadastro e Autenticação (`/login`)
              </h3>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>
                  <strong>Nome completo:</strong> identificação do cliente no pedido.
                </li>
                <li>
                  <strong>Endereço de e-mail:</strong> login único e recuperação de acesso.
                </li>
                <li>
                  <strong>Senha de acesso:</strong> armazenada exclusivamente na forma de hash
                  criptográfico (bcrypt) via Supabase Auth.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
              <h3 className="font-bold text-sm text-foreground">
                B) Perfil e Endereços (`/perfil` e `/checkout`)
              </h3>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>
                  <strong>Telefone / WhatsApp:</strong> contato direto em caso de dúvidas sobre o
                  preparo ou localização na entrega.
                </li>
                <li>
                  <strong>Endereço de Entrega:</strong> nome do local, rua, número, bairro e
                  complemento para envio de pedidos via Delivery.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
              <h3 className="font-bold text-sm text-foreground">
                C) Histórico de Pedidos (`/pedidos`)
              </h3>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>
                  <strong>Itens escolhidos e observações:</strong> pratos, adicionais e preferências
                  (ex.: remoção de ingredientes).
                </li>
                <li>
                  <strong>Modalidade e valores:</strong> tipo de consumo (Delivery ou Retirada no
                  Balcão), valor total e status em tempo real.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
              <h3 className="font-bold text-sm text-foreground">
                D) Dados de Pagamento Online (`/pedido/[id]`)
              </h3>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>
                  <strong>Forma de pagamento:</strong> Pix, Cartão de Crédito ou Cartão de Débito.
                </li>
                <li>
                  <strong>Importante:</strong> o Raízes do Nordeste{' '}
                  <strong className="text-foreground">não armazena</strong> número de cartão,
                  validade ou código de segurança (CVV) em seu banco de dados. As transações são
                  processadas via integração com o <strong>Mercado Pago</strong>.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Finalidade e Bases Legais */}
        <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Lock size={22} />
            <h2 className="text-xl font-bold text-foreground">
              2. Finalidades e Bases Legais do Tratamento (Art. 7º da LGPD)
            </h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2.5 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-foreground">Execução de Contrato (Art. 7º, V):</strong>{' '}
              processar seu pedido na cozinha, viabilizar o pagamento e realizar a entrega no
              endereço indicado.
            </li>
            <li>
              <strong className="text-foreground">Consentimento do Titular (Art. 7º, I):</strong>{' '}
              criação da conta de usuário e salvamento opcional de endereços no perfil para agilizar
              compras futuras, mediante aceite expresso nos formulários.
            </li>
            <li>
              <strong className="text-foreground">
                Cumprimento de Obrigação Legal ou Regulatória (Art. 7º, II):
              </strong>{' '}
              manutenção de registros financeiros de caixa e histórico de transações comerciais.
            </li>
            <li>
              <strong className="text-foreground">
                Legítimo Interesse e Prevenção à Fraude (Art. 7º, IX):
              </strong>{' '}
              garantir a segurança da plataforma e autenticar sessões de usuários legítimos.
            </li>
          </ul>
        </section>

        {/* 3. Cookies e Armazenamento Local */}
        <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Cookie size={22} />
            <h2 className="text-xl font-bold text-foreground">
              3. Uso de Cookies e Armazenamento Local (LocalStorage)
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nosso sistema não utiliza cookies de rastreamento publicitário de terceiros. Utilizamos
            apenas recursos técnicos estritamente necessários no seu navegador:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border border-border rounded-xl overflow-hidden">
              <thead className="bg-muted text-foreground font-bold">
                <tr>
                  <th className="p-3 border-b border-border">Identificador</th>
                  <th className="p-3 border-b border-border">Tipo</th>
                  <th className="p-3 border-b border-border">Finalidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                <tr>
                  <td className="p-3 font-mono text-xs text-foreground">sb-*-auth-token</td>
                  <td className="p-3">Cookie HTTP</td>
                  <td className="p-3">
                    Mantém a sessão autenticada do usuário com segurança via Supabase SSR.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs text-foreground">
                    raizes-do-nordeste-cart-v1
                  </td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">
                    Guarda temporariamente os pratos e adicionais inseridos na sua sacola de compras.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs text-foreground">
                    raizes-lgpd-cookie-consent
                  </td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">
                    Registra a data e a sua preferência de aceite no banner de cookies LGPD.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs text-foreground">theme</td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">
                    Armazena sua preferência visual entre modo claro e modo escuro.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Compartilhamento de Dados */}
        <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Share2 size={22} />
            <h2 className="text-xl font-bold text-foreground">
              4. Compartilhamento de Dados e Operadores
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Não vendemos nem comercializamos seus dados pessoais. Seus dados são compartilhados
            exclusivamente com os seguintes operadores essenciais para o funcionamento do serviço:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-foreground">Supabase Inc.:</strong> infraestrutura de banco de
              dados PostgreSQL e serviço de autenticação em nuvem com conexões criptografadas
              (SSL/TLS).
            </li>
            <li>
              <strong className="text-foreground">Mercado Pago:</strong> instituição de pagamento
              responsável pela geração de QR Code Pix e processamento de cartões.
            </li>
            <li>
              <strong className="text-foreground">Vercel Inc.:</strong> plataforma de hospedagem e
              entrega segura da aplicação web.
            </li>
            <li>
              <strong className="text-foreground">Equipe Interna Autorizada:</strong> colaboradores
              do restaurante (cozinha, caixa e entregadores) possuem acesso restrito por função
              (RBAC) apenas às informações necessárias para preparar e entregar seu pedido.
            </li>
          </ul>
        </section>

        {/* 5. Direitos do Titular */}
        <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <UserCheck size={22} />
            <h2 className="text-xl font-bold text-foreground">
              5. Seus Direitos como Titular dos Dados (Art. 18 da LGPD)
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A qualquer momento e de forma gratuita, você pode exercer seus direitos previstos na
            LGPD:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-foreground">Acesso e Confirmação:</strong> visualizar seus
              dados cadastrais, endereços salvos e histórico de pedidos diretamente nas páginas{' '}
              <Link href="/perfil" className="text-primary underline">
                Meu Perfil
              </Link>{' '}
              e{' '}
              <Link href="/pedidos" className="text-primary underline">
                Meus Pedidos
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">Correção de Dados:</strong> atualizar seu telefone,
              senha e gerenciar seus endereços a qualquer momento em{' '}
              <Link href="/perfil" className="text-primary underline">
                Meu Perfil
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">Eliminação e Revogação do Consentimento:</strong>{' '}
              excluir endereços salvos diretamente pelo botão de remoção no seu perfil ou solicitar a
              exclusão definitiva da sua conta junto ao nosso canal de atendimento.
            </li>
          </ul>
        </section>

        {/* 6. Retenção e Contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <Clock size={20} />
              <h2 className="text-lg font-bold text-foreground">6. Tempo de Guarda dos Dados</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Armazenamos seus dados pessoais enquanto sua conta permanecer ativa ou pelo tempo
              necessário para concluir seus pedidos. Caso você solicite a exclusão da conta, seus
              dados pessoais serão eliminados ou anonimizados, ressalvada a guarda de registros
              fiscais e financeiros pelo prazo legal previsto na legislação brasileira (Art. 16, I da
              LGPD).
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <Mail size={20} />
              <h2 className="text-lg font-bold text-foreground">
                7. Encarregado de Dados (DPO) e Contato
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Para tirar dúvidas sobre esta Política de Privacidade ou solicitar a exclusão e
              portabilidade dos seus dados pessoais, entre em contato com o nosso responsável pela
              proteção de dados:
            </p>
            <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-1">
              <p>
                <strong>Controlador:</strong> Restaurante Raízes do Nordeste
              </p>
              <p>
                <strong>E-mail LGPD / Suporte:</strong>{' '}
                <a
                  href="mailto:privacidade@raizesdonordeste.com.br"
                  className="text-primary font-semibold underline"
                >
                  privacidade@raizesdonordeste.com.br
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

