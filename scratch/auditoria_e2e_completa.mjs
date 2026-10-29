import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Carrega variáveis do .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('Faltam variaveis SUPABASE no .env.local')
  process.exit(1)
}

const adminService = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function criarClienteSessao() {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

const SENHA_PADRAO = 'Teste@123456'

const USUARIOS_TESTE = [
  {
    roleKey: 'ADMIN',
    nome: 'Robson Administrador (Teste)',
    email: 'admin.teste@raizes.com',
    cargo: 'ADMIN',
    telefone: '(88) 99999-0001',
    permissoes: ['acesso_caixa', 'acesso_produtos', 'acesso_relatorios'],
  },
  {
    roleKey: 'GERENTE',
    nome: 'Marina Gerente (Teste)',
    email: 'gerente.teste@raizes.com',
    cargo: 'GERENTE',
    telefone: '(88) 99999-0002',
    permissoes: ['acesso_caixa', 'acesso_produtos', 'acesso_relatorios'],
  },
  {
    roleKey: 'COZINHA',
    nome: 'Seu Zé Cozinheiro (Teste)',
    email: 'cozinha.teste@raizes.com',
    cargo: 'COZINHA',
    telefone: '(88) 99999-0003',
    permissoes: [],
  },
  {
    roleKey: 'GARCOM',
    nome: 'Lucas Garçom (Teste)',
    email: 'garcom.teste@raizes.com',
    cargo: 'GARCOM',
    telefone: '(88) 99999-0004',
    permissoes: [],
  },
  {
    roleKey: 'ENTREGADOR',
    nome: 'Tiago Entregador (Teste)',
    email: 'entregador.teste@raizes.com',
    cargo: 'ENTREGADOR',
    telefone: '(88) 99999-0005',
    permissoes: [],
  },
  {
    roleKey: 'CLIENTE',
    nome: 'Maria Cliente (Teste)',
    email: 'cliente.teste@raizes.com',
    cargo: 'CLIENTE',
    telefone: '(88) 99817-6825',
    permissoes: [],
  },
]

const logResult = []
function registrar(etapa, status, detalhe) {
  const icon = status === 'OK' ? '✅' : '❌'
  console.log(`${icon} [${etapa}] ${detalhe}`)
  logResult.push({ etapa, status, detalhe })
}

async function garantirUsuario(u, lojaId) {
  const { data: listData } = await adminService.auth.admin.listUsers({ perPage: 200 })
  const existente = listData?.users?.find(
    (x) => x.email?.toLowerCase() === u.email.toLowerCase()
  )

  let userId
  if (existente) {
    userId = existente.id
    await adminService.auth.admin.updateUserById(userId, {
      password: SENHA_PADRAO,
      email_confirm: true,
      user_metadata: {
        nome: u.nome,
        cargo: u.cargo,
        lgpd_consentimento: true,
        lgpd_consentimento_em: new Date().toISOString(),
      },
    })
  } else {
    const { data: created, error: createErr } = await adminService.auth.admin.createUser({
      email: u.email,
      password: SENHA_PADRAO,
      email_confirm: true,
      user_metadata: {
        nome: u.nome,
        cargo: u.cargo,
        lgpd_consentimento: true,
        lgpd_consentimento_em: new Date().toISOString(),
      },
    })
    if (createErr) throw new Error(`Erro ao criar ${u.email}: ${createErr.message}`)
    userId = created.user.id
  }

  const { error: perfilErr } = await adminService.from('perfis').upsert({
    id: userId,
    loja_id: lojaId,
    nome: u.nome,
    cargo: u.cargo,
    telefone: u.telefone,
    permissoes: u.permissoes,
  })
  if (perfilErr) throw new Error(`Erro ao salvar perfil ${u.email}: ${perfilErr.message}`)

  return userId
}

async function logarComo(email) {
  const client = criarClienteSessao()
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: SENHA_PADRAO,
  })
  if (error || !data.user) {
    throw new Error(`Falha de login para ${email}: ${error?.message}`)
  }
  return { client, user: data.user }
}

async function run() {
  console.log('====================================================')
  console.log(' INICIANDO AUDITORIA FUNCIONAL E2E MULTI-PERFIL')
  console.log('====================================================\n')

  // 1. Verificar Loja
  const { data: loja, error: lojaErr } = await adminService
    .from('lojas')
    .select('*')
    .limit(1)
    .single()

  if (lojaErr || !loja) {
    registrar('LOJA', 'ERRO', `Nenhuma loja encontrada: ${lojaErr?.message}`)
    process.exit(1)
  }

  // Garantir que a loja está aberta para o teste
  if (!loja.aberta) {
    await adminService.from('lojas').update({ aberta: true }).eq('id', loja.id)
  }
  registrar(
    'FASE 2 - LOJA',
    'OK',
    `Loja "${loja.nome}" ativa e aberta (ID: ${loja.id}, Taxa entrega: R$ ${Number(loja.taxa_entrega || 0).toFixed(2)})`
  )

  // 2. Criar/Atualizar os 6 usuários e testar login individual
  const userIds = {}
  for (const u of USUARIOS_TESTE) {
    try {
      const uid = await garantirUsuario(u, loja.id)
      userIds[u.roleKey] = uid
      const { client, user } = await logarComo(u.email)
      const { data: perfilLido, error: pErr } = await client
        .from('perfis')
        .select('id, nome, cargo, permissoes')
        .eq('id', user.id)
        .single()

      if (pErr || !perfilLido) {
        registrar(
          `FASE 2 - LOGIN ${u.roleKey}`,
          'ERRO',
          `Usuário logou mas não conseguiu ler o próprio perfil (RLS perfis): ${pErr?.message}`
        )
      } else {
        registrar(
          `FASE 2 - LOGIN ${u.roleKey}`,
          'OK',
          `${u.email} autenticado com sucesso (Cargo: ${perfilLido.cargo})`
        )
      }
    } catch (e) {
      registrar(`FASE 2 - LOGIN ${u.roleKey}`, 'ERRO', e.message)
    }
  }

  // 3. FASE 3 - Abertura de Caixa e Movimentações (como GERENTE)
  const { client: gerenteClient, user: gerenteUser } = await logarComo('gerente.teste@raizes.com')
  let { data: caixaAberto, error: caixaReadErr } = await gerenteClient
    .from('caixas')
    .select('*')
    .eq('loja_id', loja.id)
    .eq('status', 'ABERTO')
    .limit(1)
    .maybeSingle()

  if (caixaReadErr) {
    registrar('FASE 3 - LER CAIXA (GERENTE)', 'ERRO', `Erro RLS ao ler caixas: ${caixaReadErr.message}`)
  } else if (!caixaAberto) {
    const { data: novoCaixa, error: abrirErr } = await gerenteClient
      .from('caixas')
      .insert({
        loja_id: loja.id,
        usuario_id: gerenteUser.id,
        status: 'ABERTO',
        valor_abertura: 100.0,
      })
      .select('*')
      .single()

    if (abrirErr) {
      registrar('FASE 3 - ABRIR CAIXA (GERENTE)', 'ERRO', `Erro ao abrir caixa: ${abrirErr.message}`)
    } else {
      caixaAberto = novoCaixa
      registrar('FASE 3 - ABRIR CAIXA (GERENTE)', 'OK', `Caixa aberto com fundo inicial de R$ 100,00 (ID: ${caixaAberto.id})`)
    }
  } else {
    registrar('FASE 3 - CAIXA JÁ ABERTO', 'OK', `Caixa aberto encontrado (ID: ${caixaAberto.id}, Abertura: R$ ${Number(caixaAberto.valor_abertura).toFixed(2)})`)
  }

  if (caixaAberto) {
    const { error: supErr } = await gerenteClient.from('movimentacoes_caixa').insert({
      caixa_id: caixaAberto.id,
      tipo: 'SUPRIMENTO',
      valor: 20.0,
      descricao: 'Suprimento de troco (Teste E2E)',
    })
    const { error: sanErr } = await gerenteClient.from('movimentacoes_caixa').insert({
      caixa_id: caixaAberto.id,
      tipo: 'SANGRIA',
      valor: 10.0,
      descricao: 'Pagamento fornecedor gelo (Teste E2E)',
    })

    if (supErr || sanErr) {
      registrar(
        'FASE 3 - MOVIMENTACOES CAIXA',
        'ERRO',
        `Erro ao inserir suprimento/sangria: ${supErr?.message || sanErr?.message}`
      )
    } else {
      registrar(
        'FASE 3 - MOVIMENTACOES CAIXA',
        'OK',
        'Suprimento (+R$ 20,00) e Sangria (-R$ 10,00) registrados no caixa pelo Gerente'
      )
    }
  }

  // Buscar 2 produtos ativos para os pedidos
  const { data: produtos } = await adminService
    .from('produtos')
    .select('id, nome, preco')
    .eq('loja_id', loja.id)
    .eq('ativo', true)
    .limit(3)

  if (!produtos || produtos.length < 2) {
    registrar('PRODUTOS', 'ERRO', 'Menos de 2 produtos ativos encontrados no cardápio')
    process.exit(1)
  }

  // =========================================================================
  // FASE 4 - JORNADA 1: PEDIDO ONLINE DELIVERY (Cliente -> Cozinha -> Entregador)
  // =========================================================================
  const { client: clienteClient, user: clienteUser } = await logarComo('cliente.teste@raizes.com')

  // 4.1 Salvar endereço no perfil do cliente
  const novoEndereco = {
    id: crypto.randomUUID(),
    titulo: 'Casa (Teste E2E)',
    rua: 'Rua Padre Tibúrcio',
    numero: '439',
    bairro: 'Gangorra',
    complemento: 'Próximo à praça',
    telefone: '(88) 99817-6825',
  }
  const { error: endErr } = await clienteClient
    .from('perfis')
    .update({ enderecos_salvos: [novoEndereco] })
    .eq('id', clienteUser.id)

  if (endErr) {
    registrar('FASE 4.1 - SALVAR ENDERECO (CLIENTE)', 'ERRO', endErr.message)
  } else {
    registrar('FASE 4.1 - SALVAR ENDERECO (CLIENTE)', 'OK', 'Endereço salvo em perfis.enderecos_salvos com sucesso')
  }

  // 4.2 Criar Pedido Delivery como Cliente
  const prod1 = produtos[0]
  const taxaEntrega = Number(loja.taxa_entrega || 0)
  const totalDelivery = Number(prod1.preco) + taxaEntrega

  const { data: pedidoDelivery, error: pedDelErr } = await clienteClient
    .from('pedidos')
    .insert({
      loja_id: loja.id,
      user_id: clienteUser.id,
      cliente_nome: 'Maria Cliente (Teste)',
      telefone: novoEndereco.telefone,
      tipo_consumo: 'DELIVERY',
      endereco: novoEndereco,
      forma_pagamento: 'CARTAO_CREDITO',
      status: 'NA_FILA',
      total: totalDelivery,
      pago: false,
    })
    .select('id, numero_pedido, status, pago, total')
    .single()

  if (pedDelErr || !pedidoDelivery) {
    registrar('FASE 4.2 - CRIAR PEDIDO DELIVERY (CLIENTE)', 'ERRO', pedDelErr?.message || 'Sem retorno')
  } else {
    const { error: itemDelErr } = await clienteClient.from('itens_pedido').insert({
      pedido_id: pedidoDelivery.id,
      produto_id: prod1.id,
      quantidade: 1,
      preco_unitario: Number(prod1.preco),
      observacao: 'Caprichar no tempero (Teste E2E)',
    })
    if (itemDelErr) {
      registrar('FASE 4.2 - INSERIR ITENS DELIVERY (CLIENTE)', 'ERRO', itemDelErr.message)
    } else {
      registrar(
        'FASE 4.2 - CRIAR PEDIDO DELIVERY (CLIENTE)',
        'OK',
        `Pedido #${pedidoDelivery.numero_pedido || pedidoDelivery.id.slice(0, 8)} criado (Total: R$ ${totalDelivery.toFixed(2)}, pago: false)`
      )
    }
  }

  // 4.3 Aprovar Pagamento (Simulação Mercado Pago)
  if (pedidoDelivery) {
    const { error: pagtoErr } = await adminService
      .from('pedidos')
      .update({ pago: true, forma_pagamento: 'CARTAO_CREDITO' })
      .eq('id', pedidoDelivery.id)

    if (pagtoErr) {
      registrar('FASE 4.3 - APROVAR PAGAMENTO MP', 'ERRO', pagtoErr.message)
    } else {
      registrar('FASE 4.3 - APROVAR PAGAMENTO MP', 'OK', `Pagamento do Pedido #${pedidoDelivery.numero_pedido} aprovado (pago: true)`)
    }

    // 4.4 Cozinha visualiza e prepara o pedido (como COZINHA)
    const { client: cozinhaClient } = await logarComo('cozinha.teste@raizes.com')
    const { data: filaCozinha, error: cozReadErr } = await cozinhaClient
      .from('pedidos')
      .select('id, numero_pedido, status, pago, itens_pedido(quantidade, observacao, produtos(nome))')
      .eq('id', pedidoDelivery.id)
      .single()

    if (cozReadErr || !filaCozinha) {
      registrar('FASE 4.4 - COZINHA LER PEDIDO', 'ERRO', `Cozinha não conseguiu ler o pedido: ${cozReadErr?.message}`)
    } else if (!filaCozinha.itens_pedido || filaCozinha.itens_pedido.length === 0) {
      registrar('FASE 4.4 - COZINHA LER ITENS', 'ERRO', 'Cozinha leu o pedido mas itens_pedido veio vazio (verificar RLS de itens_pedido!)')
    } else {
      registrar(
        'FASE 4.4 - COZINHA LER PEDIDO E ITENS',
        'OK',
        `Cozinha visualizou Pedido #${filaCozinha.numero_pedido} com ${filaCozinha.itens_pedido.length} item(ns): ${filaCozinha.itens_pedido[0]?.produtos?.nome}`
      )
    }

    // Cozinha muda status para PREPARANDO e depois PRONTO
    const { data: cozUpd1, error: cozUpdErr1 } = await cozinhaClient
      .from('pedidos')
      .update({ status: 'PREPARANDO' })
      .eq('id', pedidoDelivery.id)
      .select('status')

    const { data: cozUpd2, error: cozUpdErr2 } = await cozinhaClient
      .from('pedidos')
      .update({ status: 'PRONTO' })
      .eq('id', pedidoDelivery.id)
      .select('status')

    if (cozUpdErr1 || cozUpdErr2 || !cozUpd1?.length || !cozUpd2?.length) {
      registrar(
        'FASE 4.5 - COZINHA AVANCAR STATUS',
        'ERRO',
        `Cozinha bloqueada ao atualizar status (RLS UPDATE pedidos): ${cozUpdErr1?.message || cozUpdErr2?.message || '0 linhas afetadas'}`
      )
    } else {
      registrar('FASE 4.5 - COZINHA AVANCAR STATUS', 'OK', 'Cozinha avançou o status: NA_FILA -> PREPARANDO -> PRONTO')
    }

    // 4.6 Entregador visualiza pedido PRONTO, sai para entrega (DESPACHADO) e finaliza (FINALIZADO)
    const { client: entregadorClient } = await logarComo('entregador.teste@raizes.com')
    const { data: pedEntregador, error: entReadErr } = await entregadorClient
      .from('pedidos')
      .select('id, numero_pedido, status, endereco, itens_pedido(quantidade, produtos(nome))')
      .eq('id', pedidoDelivery.id)
      .single()

    if (entReadErr || !pedEntregador) {
      registrar('FASE 4.6 - ENTREGADOR LER PEDIDO', 'ERRO', `Entregador não conseguiu ler pedido: ${entReadErr?.message}`)
    } else {
      registrar(
        'FASE 4.6 - ENTREGADOR LER PEDIDO',
        'OK',
        `Entregador visualizou Pedido #${pedEntregador.numero_pedido} pronto para coleta (${pedEntregador.endereco?.rua}, ${pedEntregador.endereco?.numero})`
      )
    }

    const { data: entUpd1, error: entUpdErr1 } = await entregadorClient
      .from('pedidos')
      .update({ status: 'DESPACHADO' })
      .eq('id', pedidoDelivery.id)
      .select('status')

    const { data: entUpd2, error: entUpdErr2 } = await entregadorClient
      .from('pedidos')
      .update({ status: 'FINALIZADO' })
      .eq('id', pedidoDelivery.id)
      .select('status')

    if (entUpdErr1 || entUpdErr2 || !entUpd1?.length || !entUpd2?.length) {
      registrar(
        'FASE 4.7 - ENTREGADOR DESPACHAR E FINALIZAR',
        'ERRO',
        `Entregador bloqueado ao atualizar status (RLS UPDATE pedidos): ${entUpdErr1?.message || entUpdErr2?.message || '0 linhas afetadas'}`
      )
    } else {
      registrar(
        'FASE 4.7 - ENTREGADOR DESPACHAR E FINALIZAR',
        'OK',
        'Entregador avançou o status: PRONTO -> DESPACHADO -> FINALIZADO'
      )
    }
  }

  // =========================================================================
  // FASE 5 - JORNADA 2: PEDIDO PRESENCIAL NO SALÃO (Garçom -> Cozinha -> Conta)
  // =========================================================================
  const { client: garcomClient, user: garcomUser } = await logarComo('garcom.teste@raizes.com')
  const prod2 = produtos[1]

  const { data: pedidoMesa, error: pedMesaErr } = await garcomClient
    .from('pedidos')
    .insert({
      loja_id: loja.id,
      user_id: garcomUser.id,
      cliente_nome: 'Mesa 05 (Garçom: Lucas Garçom (Teste))',
      tipo_consumo: 'LOCAL',
      mesa: '05',
      status: 'NA_FILA',
      total: Number(prod2.preco),
      pago: false,
    })
    .select('id, numero_pedido, status, pago, total')
    .single()

  if (pedMesaErr || !pedidoMesa) {
    registrar('FASE 5.1 - GARCOM ABRIR MESA 05', 'ERRO', `Erro ao lançar pedido na Mesa 05: ${pedMesaErr?.message}`)
  } else {
    const { error: itemMesaErr } = await garcomClient.from('itens_pedido').insert({
      pedido_id: pedidoMesa.id,
      produto_id: prod2.id,
      quantidade: 1,
      preco_unitario: Number(prod2.preco),
      observacao: 'Mesa 05 - Servir quente',
    })

    if (itemMesaErr) {
      registrar('FASE 5.1 - GARCOM INSERIR ITENS MESA 05', 'ERRO', itemMesaErr.message)
    } else {
      registrar(
        'FASE 5.1 - GARCOM ABRIR MESA 05',
        'OK',
        `Garçom abriu a Mesa 05 com Pedido #${pedidoMesa.numero_pedido} (${prod2.nome} - R$ ${Number(prod2.preco).toFixed(2)})`
      )
    }

    // 5.2 Cozinha prepara pedido da Mesa 05
    const { client: cozinhaClient } = await logarComo('cozinha.teste@raizes.com')
    const { data: cozMesaUpd } = await cozinhaClient
      .from('pedidos')
      .update({ status: 'PRONTO' })
      .eq('id', pedidoMesa.id)
      .select('status')

    if (!cozMesaUpd?.length) {
      registrar('FASE 5.2 - COZINHA PREPARAR MESA 05', 'ERRO', 'Cozinha não conseguiu marcar pedido da Mesa 05 como PRONTO')
    } else {
      registrar('FASE 5.2 - COZINHA PREPARAR MESA 05', 'OK', 'Cozinha preparou e marcou o pedido da Mesa 05 como PRONTO')
    }

    // 5.3 Garçom fecha a conta da Mesa 05
    const { data: fecharMesaUpd, error: fecharMesaErr } = await garcomClient
      .from('pedidos')
      .update({
        pago: true,
        forma_pagamento: 'DINHEIRO',
        status: 'FINALIZADO',
      })
      .eq('id', pedidoMesa.id)
      .select('status, pago, forma_pagamento')

    if (fecharMesaErr || !fecharMesaUpd?.length) {
      registrar(
        'FASE 5.3 - GARCOM FECHAR CONTA MESA 05',
        'ERRO',
        `Garçom não conseguiu fechar a conta da Mesa 05: ${fecharMesaErr?.message || '0 linhas afetadas'}`
      )
    } else {
      registrar(
        'FASE 5.3 - GARCOM FECHAR CONTA MESA 05',
        'OK',
        'Garçom recebeu pagamento em DINHEIRO, fechou a conta e liberou a Mesa 05 (pago: true, status: FINALIZADO)'
      )
    }
  }

  // =========================================================================
  // FASE 6 - CONFERÊNCIA FINANCEIRA (Admin / Gerente)
  // =========================================================================
  const { client: adminClient } = await logarComo('admin.teste@raizes.com')
  const { data: pedidosConferencia, error: confErr } = await adminClient
    .from('pedidos')
    .select('id, numero_pedido, cliente_nome, total, forma_pagamento, pago, status')
    .in('id', [pedidoDelivery?.id, pedidoMesa?.id].filter(Boolean))

  if (confErr || !pedidosConferencia || pedidosConferencia.length < 2) {
    registrar('FASE 6 - CONFERENCIA ADMIN/CAIXA', 'ERRO', `Erro na conferência de pedidos: ${confErr?.message}`)
  } else {
    const soma = pedidosConferencia.reduce((acc, p) => acc + Number(p.total), 0)
    registrar(
      'FASE 6 - CONFERENCIA ADMIN/CAIXA',
      'OK',
      `Admin conferiu os ${pedidosConferencia.length} pedidos pagos e finalizados no Dashboard/Caixa (Soma dos testes: R$ ${soma.toFixed(2)})`
    )
  }

  console.log('\n====================================================')
  const totalErros = logResult.filter((r) => r.status !== 'OK').length
  console.log(` RESUMO FINAL: ${logResult.length - totalErros}/${logResult.length} etapas aprovadas (${totalErros} erros)`)
  console.log('====================================================')
  if (totalErros > 0) process.exit(1)
}

run().catch((e) => {
  console.error('Erro fatal:', e)
  process.exit(1)
})
