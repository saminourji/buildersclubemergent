import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isPast } from 'date-fns'
import { Event, AgendaSlot } from '@/types/database'
import { CheckinCodeInput } from '@/components/checkin-code-input'
import { formatET, formatAgendaTime } from '@/lib/helpers'

const TYPE_LABELS: Record<string, string> = {
  announcement: 'ANNOUNCE', speaker: 'SPEAKER', demo: 'DEMO',
}

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
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

  const visibleSlots = profile?.is_admin ? (slots ?? []) : (slots ?? []).filter(s => s.approved)
  const isFuture = !isPast(new Date(event.event_date))

  const { data: attendeeCheckins } = await supabase
    .from('check_ins').select('member_id').eq('event_id', id)
  const attendeeIds = attendeeCheckins?.map(c => c.member_id) ?? []

  let attendees: { full_name: string | null; email: string }[] = []
  if (attendeeIds.length > 0) {
    const { data } = await supabase
      .from('profiles').select('full_name, email').in('id', attendeeIds)
    attendees = data ?? []
  }

  const maxDemos = event.max_demos ?? 3
  const demoCount = (slots ?? []).filter(s => s.slot_type === 'demo').length
  const isPastMeeting = isPast(new Date(event.event_date))

  // Calculate cumulative start times for agenda
  let cumulativeMinutes = 0

  return (
    <>
      <p><b>{event.title}</b></p>
      <p style={{ fontSize: 12, color: '#828282' }}>
        {formatET(event.event_date, 'full')} · Nelson Center, 4th floor
      </p>
      {event.description && <p style={{ marginTop: 8, fontSize: 12 }}>{event.description}</p>}

      <hr />

      <p style={{ fontSize: 12 }}>
        {'Check-in: '}
        {alreadyCheckedIn ? (
          <span style={{ color: 'green' }}><b>[you attended this meeting]</b></span>
        ) : event.checkin_open ? (
          <CheckinCodeInput eventId={event.id} expectedCode={event.qr_token} />
        ) : isFuture ? (
          <span style={{ color: '#828282' }}>not opened yet</span>
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
                <th style={{ width: 60 }}>time</th>
                <th style={{ width: 70 }}>type</th>
                <th>item</th>
                <th>presenter</th>
                <th style={{ width: 40 }}>est.</th>
              </tr>
            </thead>
            <tbody>
              {visibleSlots.map(slot => {
                const slotTime = formatAgendaTime(event.event_date, cumulativeMinutes)
                cumulativeMinutes += slot.estimated_minutes ?? 5
                return (
                  <tr key={slot.id} style={{ opacity: slot.approved ? 1 : 0.5 }}>
                    <td style={{ fontSize: 10, fontFamily: 'monospace', color: '#666' }}>{slotTime}</td>
                    <td style={{ fontSize: 10, fontFamily: 'monospace' }}>[{TYPE_LABELS[slot.slot_type]}]</td>
                    <td>
                      {slot.title}
                      {slot.description && (
                        <span style={{ display: 'block', fontSize: 11, color: '#666', marginTop: 1 }}>{slot.description}</span>
                      )}
                      {!slot.approved && <span style={{ color: '#0066cc', fontSize: 10 }}> (pending approval)</span>}
                    </td>
                    <td style={{ fontSize: 11 }}>{slot.presenter_name ?? '—'}</td>
                    <td style={{ fontSize: 11, color: '#666' }}>{slot.estimated_minutes}m</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      <hr />
      {isPastMeeting ? (
        <p style={{ fontSize: 12, color: '#828282' }}>This meeting has already taken place. Demo requests are closed.</p>
      ) : demoCount < maxDemos ? (
        <DemoSignupForm eventId={event.id} userId={user.id} slotsLeft={maxDemos - demoCount} />
      ) : (
        <p style={{ fontSize: 12, color: '#828282' }}>Demo slots are full ({maxDemos} max for this meeting).</p>
      )}

      {attendees.length > 0 && (
        <>
          <hr />
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>ATTENDEES ({attendees.length})</p>
          <ul style={{ paddingLeft: 20, listStyleType: 'disc' }}>
            {attendees.map((a, i) => (
              <li key={i} style={{ fontSize: 12 }}>
                {a.full_name ?? a.email}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

function DemoSignupForm({ eventId, userId, slotsLeft }: { eventId: string; userId: string; slotsLeft: number }) {
  return (
    <form action="/api/demo-signup" method="post">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="presenter_id" value={userId} />
      <p style={{ fontSize: 12, marginBottom: 4 }}>
        <b>Request a demo slot</b> ({slotsLeft} left)
      </p>
      <p style={{ fontSize: 11, color: '#828282', marginBottom: 8 }}>
        No slides needed. Under 5 min: explain your idea + live demo. The rest is Q&amp;A and roast from the room.
      </p>
      <input name="title" placeholder="title — what are you presenting?" required style={{ width: '100%', maxWidth: 350, marginBottom: 4, display: 'block' }} />
      <input name="description" placeholder="one sentence description (optional)" style={{ width: '100%', maxWidth: 350, marginBottom: 4, display: 'block' }} />
      <button type="submit" style={{ background: '#d4e6f1', border: '1px solid #b0c4d8', padding: '2px 10px', cursor: 'pointer' }}>
        request slot
      </button>
    </form>
  )
}
