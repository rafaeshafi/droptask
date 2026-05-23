import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  let { data: tokenRow } = await admin
    .from('email_tokens')
    .select('token')
    .eq('user_id', user.id)
    .single()

  if (!tokenRow) {
    const token = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
    const { data } = await admin
      .from('email_tokens')
      .insert({ user_id: user.id, token })
      .select('token')
      .single()
    tokenRow = data
  }

  const domain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'mail.yourdomain.com'
  return NextResponse.json({ email: `${tokenRow!.token}@${domain}` })
}
