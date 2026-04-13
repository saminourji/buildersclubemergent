import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const event_id = formData.get('event_id') as string
  const presenter_id = formData.get('presenter_id') as string
  const title = formData.get('title') as string

  if (!event_id || !title) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: { user: authUser } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', authUser!.id)
    .single()

  const { error } = await supabase.from('agenda_slots').insert({
    event_id,
    presenter_id: authUser!.id,
    presenter_name: profile?.full_name ?? null,
    slot_type: 'demo',
    title,
    slot_order: 99,
    approved: false,
  })

  if (error) {
    return NextResponse.redirect(new URL(`/events/${event_id}?error=already_signed_up`, request.url))
  }

  return NextResponse.redirect(new URL(`/events/${event_id}?signed_up=1`, request.url))
}
