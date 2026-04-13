import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const event_id = formData.get('event_id') as string
  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null

  if (!event_id || !title) {
    return NextResponse.redirect(new URL('/meetings', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).single()

  const { data: event } = await supabase
    .from('events').select('max_demos, event_date').eq('id', event_id).single()
  const maxDemos = event?.max_demos ?? 3

  // Block requests for past meetings
  if (event?.event_date && new Date(event.event_date) < new Date()) {
    return NextResponse.redirect(new URL(`/meetings/${event_id}`, request.url))
  }

  const { count } = await supabase
    .from('agenda_slots').select('*', { count: 'exact', head: true })
    .eq('event_id', event_id).eq('slot_type', 'demo')

  if ((count ?? 0) >= maxDemos) {
    return NextResponse.redirect(new URL(`/meetings/${event_id}`, request.url))
  }

  const { data: maxSlot } = await supabase
    .from('agenda_slots').select('slot_order')
    .eq('event_id', event_id)
    .order('slot_order', { ascending: false })
    .limit(1)

  const nextOrder = maxSlot && maxSlot.length > 0 ? maxSlot[0].slot_order + 1 : 1

  await supabase.from('agenda_slots').insert({
    event_id,
    title,
    description,
    slot_type: 'demo',
    presenter_name: profile?.full_name ?? user.email ?? 'Unknown',
    presenter_id: user.id,
    slot_order: nextOrder,
    estimated_minutes: 5,
    approved: false,
  })

  return NextResponse.redirect(new URL(`/meetings/${event_id}`, request.url))
}
