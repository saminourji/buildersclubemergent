import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Find event by token or id
  const { data: event } = await supabase
    .from('events')
    .select('id, checkin_open, title')
    .or(`qr_token.eq.${token},id.eq.${token}`)
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (!event.checkin_open) {
    return NextResponse.json({ error: 'Check-in is not open for this event' }, { status: 400 })
  }

  const { error } = await supabase.from('check_ins').insert({
    member_id: user.id,
    event_id: event.id,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already checked in' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, event_title: event.title })
}
