import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use user's own session — RLS allows them to manage their own tokens
  let { data: tokenRow } = await supabase
    .from('email_tokens')
    .select('token')
    .eq('user_id', user.id)
    .single()

  if (!tokenRow) {
    const token = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
    const { data, error: insertError } = await supabase
      .from('email_tokens')
      .insert({ user_id: user.id, token })
      .select('token')
      .single()

    if (insertError) {
      console.error('Token insert error:', JSON.stringify(insertError))
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    tokenRow = data
  }

  if (!tokenRow) {
    return NextResponse.json({ error: 'Could not generate token' }, { status: 500 })
  }

  const domain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'mail.yourdomain.com'
  return NextResponse.json({ email: `${tokenRow.token}@${domain}` })
}
