import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Event, AgendaSlot } from '@/types/database'
import { CheckInButton } from '@/components/checkin-button'

const TYPE_LABELS: Record<string, string> = {
  announcement: 'ANNOUNCE', speaker: 'SPEAKER', demo: 'DEMO',
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: event } = await supabase
    .from('events').select('*').eq('id', id).single() as { data: Event | null }
  if (!event) notFound()

  const { data: slots } = await supabase
    .from('agenda_slots').select('*').eq('event_id', id)
    .order('slot_order', { ascending: true }) as { data: AgendaSlot[] | null }

  const { data: checkIn } = await supabase
    .from('check_ins').select('id')
    .eq('member_id', user.id).eq('event_id', id).single()

  const alreadyCheckedIn = !!checkIn

  const { data: profile } = await supabase
    .from('profiles').select('is_admin, full_name').eq('id', user.id).single()

  const visibleSlots = profile?.is_admin
    ? (slots ?? [])
    : (slots ?? []).filter(s => s.approved)

  return (
    <>
      <p><b>{event.title}</b></p>
      <p style={{ fontSize: 12, color: '#828282' }}>
        {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy — h:mm a')}
      </p>

      {event.description && <p style={{ marginTop: 8, fontSize: 12 }}>{event.description}</p>}

      <hr />

      <p style={{ fontSize: 12 }}>
        {'Check-in: '}
        {alreadyCheckedIn ? (
          <span style={{ color: 'green' }}><b>[you attended this meeting]</b></span>
        ) : event.checkin_open ? (
          <CheckInButton eventId={event.id} />
        ) : (
          <span style={{ color: '#828282' }}>closed</span>
        )}
      </p>

      {visibleSlots.length > 0 && (
        <>
          <hr />
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>AGENDA</p>
          <table>
            <thead>
              <tr>
                <th style={{ width: 80 }}>type</th>
                <th>item</th>
                <th>presenter</th>
              </tr>
            </thead>
            <tbody>
              {visibleSlots.map(slot => (
                <tr key={slot.id} style={{ opacity: slot.approved ? 1 : 0.5 }}>
                  <td style={{ fontSize: 10, fontFamily: 'monospace' }}>
                    [{TYPE_LABELS[slot.slot_type]}]
                  </td>
                  <td>
                    {slot.title}
                    {!slot.approved && <span style={{ color: '#ff6600', fontSize: 10 }}> (pending)</span>}
                  </td>
                  <td style={{ fontSize: 11 }}>{slot.presenter_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {event.checkin_open && !alreadyCheckedIn && (
        <>
          <hr />
          <DemoSignupForm eventId={event.id} userId={user.id} />
        </>
      )}
    </>
  )
}

function DemoSignupForm({ eventId, userId }: { eventId: string; userId: string }) {
  return (
    <form action="/api/demo-signup" method="post">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="presenter_id" value={userId} />
      <p style={{ fontSize: 12, marginBottom: 4 }}>
        <b>Want to demo?</b>
      </p>
      <input name="title" placeholder="what are you demoing?" required style={{ width: 250, marginRight: 4 }} />
      <button type="submit" style={{ background: '#e8e8df', border: '1px solid #999', padding: '2px 10px', cursor: 'pointer' }}>
        sign up
      </button>
    </form>
  )
}
