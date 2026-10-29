import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
}

const adminService = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: perfis } = await adminService.from('perfis').select('id, nome, cargo, telefone')
const perfisMap = new Map((perfis || []).map(p => [p.id, p]))

const { data, error } = await adminService.auth.admin.listUsers({ perPage: 200 })
if (error) {
  console.error('Erro:', error)
  process.exit(1)
}

console.log(`Total de usuários no Supabase Auth: ${data.users.length}\n`)
for (const u of data.users) {
  const p = perfisMap.get(u.id)
  const nome = p?.nome || u.user_metadata?.nome || u.user_metadata?.full_name || ''
  // Atualiza display_name / full_name no Auth se ainda não estiver preenchido
  if (nome && (!u.user_metadata?.full_name || !u.user_metadata?.display_name)) {
    await adminService.auth.admin.updateUserById(u.id, {
      user_metadata: {
        ...u.user_metadata,
        nome,
        name: nome,
        full_name: nome,
        display_name: nome,
      },
    })
  }
  console.log(`- ${u.email.padEnd(38)} | Cargo: ${(p?.cargo || 'N/A').padEnd(11)} | Nome: ${nome || '-'}`)
}

