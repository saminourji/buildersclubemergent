import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { Event } from '@/types/database'
import { AdminEventActions } from '@/components/admin-event-actions'

export default async function AdminMeetingsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events').select('*').order('event_date', { ascending: false }) as { data: Event[] | null }

  return (
    <>
      <p>
        <b>Meetings</b>{' '}
        <Link href="/admin/meetings/new" style={{ fontSize: 12 }}>[+ new meeting]</Link>
      </p>
      <hr />

      {events && events.length > 0 ? (
        <table>
          <thead><tr><th>date</th><th>meeting</th><th>check-in</th><th>actions</th></tr></thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>{format(new Date(event.event_date), 'MMM d, yyyy')}</td>
                <td><Link href={`/admin/meetings/${event.id}`}>{event.title}</Link></td>
                <td style={{ fontSize: 11 }}>
                  {event.checkin_open
                    ? <span style={{ color: '#0066cc' }}>[open]</span>
                    : <span style={{ color: '#999' }}>[closed]</span>}
                </td>
                <td><AdminEventActions eventId={event.id} eventTitle={event.title} checkinOpen={event.checkin_open} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#828282', fontSize: 12 }}>No meetings yet.</p>
      )}
    </>
  )
}
