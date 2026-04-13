import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format, isPast } from 'date-fns'
import { Event } from '@/types/database'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false }) as { data: Event[] | null }

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('event_id')
    .eq('member_id', user.id)

  const checkedInIds = new Set(checkIns?.map(c => c.event_id) ?? [])

  const upcoming = events?.filter(e => !isPast(new Date(e.event_date))) ?? []
  const past = events?.filter(e => isPast(new Date(e.event_date))) ?? []

  return (
    <>
      <p><b>Events</b></p>
      <hr />

      {upcoming.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>UPCOMING</p>
          <EventTable events={upcoming} checkedInIds={checkedInIds} />
        </>
      )}

      {past.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4, marginTop: 16 }}>PAST</p>
          <EventTable events={past} checkedInIds={checkedInIds} dim />
        </>
      )}

      {(events?.length ?? 0) === 0 && (
        <p style={{ color: '#828282', fontSize: 12 }}>No events yet.</p>
      )}
    </>
  )
}

function EventTable({ events, checkedInIds, dim }: { events: Event[]; checkedInIds: Set<string>; dim?: boolean }) {
  return (
    <table>
      <thead>
        <tr>
          <th>date</th>
          <th>event</th>
          <th>status</th>
        </tr>
      </thead>
      <tbody>
        {events.map(event => (
          <tr key={event.id} style={{ opacity: dim ? 0.5 : 1 }}>
            <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>
              {format(new Date(event.event_date), 'MMM d, yyyy')}
            </td>
            <td>
              <Link href={`/events/${event.id}`}>{event.title}</Link>
            </td>
            <td style={{ fontSize: 11 }}>
              {checkedInIds.has(event.id) ? (
                <span style={{ color: 'green' }}>[attended]</span>
              ) : event.checkin_open && !isPast(new Date(event.event_date)) ? (
                <span style={{ color: '#ff6600' }}>[open]</span>
              ) : (
                '—'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
