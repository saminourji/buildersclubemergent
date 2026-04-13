import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { subject, body, audience } = await request.json()
  if (!subject || !body || !audience) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  let recipientsQuery = supabase.from('profiles').select('email, full_name')
  if (audience === 'verified') recipientsQuery = recipientsQuery.eq('is_verified', true)
  if (audience === 'unverified') recipientsQuery = recipientsQuery.eq('is_verified', false)

  const { data: recipients } = await recipientsQuery

  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY
  let simulated = false

  if (resendKey && resendKey !== 'your_resend_api_key_here') {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(resendKey)

      const BATCH = 50
      for (let i = 0; i < recipients.length; i += BATCH) {
        const batch = recipients.slice(i, i + BATCH)
        await resend.emails.send({
          from: 'Builders Club <onboarding@resend.dev>',
          to: batch.map(r => r.email),
          subject,
          text: body,
        })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[EMAIL BLAST] Resend error:', message)
      simulated = true
    }
  } else {
    console.log(`[EMAIL BLAST] No RESEND_API_KEY — simulating send to ${recipients.length} recipients`)
    simulated = true
  }

  await supabase.from('email_blasts').insert({
    subject, body, audience, sent_by: user.id, recipient_count: recipients.length,
  })

  return NextResponse.json({ success: true, count: recipients.length, simulated })
}
