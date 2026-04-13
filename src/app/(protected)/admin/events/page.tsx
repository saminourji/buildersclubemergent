import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { Event } from '@/types/database'
import { AdminEventActions } from '@/components/admin-event-actions'

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events').select('*').order('event_date', { ascending: false }) as { data: Event[] | null }

  return (
    <>
      <p>
        <b>Events</b>{' '}
        <Link href="/admin/events/new" style={{ fontSize: 12 }}>[+ new event]</Link>
      </p>
      <hr />

      {events && events.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>date</th>
              <th>event</th>
              <th>check-in</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>
                  {format(new Date(event.event_date), 'MMM d, yyyy')}
                </td>
                <td>
                  <Link href={`/admin/events/${event.id}`}>{event.title}</Link>
                </td>
                <td style={{ fontSize: 11 }}>
                  {event.checkin_open
                    ? <span style={{ color: '#ff6600' }}>[open]</span>
                    : <span style={{ color: '#999' }}>[closed]</span>}
                </td>
                <td>
                  <AdminEventActions eventId={event.id} checkinOpen={event.checkin_open} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#828282', fontSize: 12 }}>No events yet.</p>
      )}
    </>
  )
}
