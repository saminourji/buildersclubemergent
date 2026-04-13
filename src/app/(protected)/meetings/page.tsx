import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format, isPast, isBefore } from 'date-fns'
import { Event } from '@/types/database'

export default async function MeetingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: events } = await supabase
    .from('events').select('*')
    .order('event_date', { ascending: false }) as { data: Event[] | null }

  const { data: checkIns } = await supabase
    .from('check_ins').select('event_id').eq('member_id', user.id)

  const checkedInIds = new Set(checkIns?.map(c => c.event_id) ?? [])

  const now = new Date()
  const upcoming = events?.filter(e => !isPast(new Date(e.event_date))) ?? []
  const past = events?.filter(e => isPast(new Date(e.event_date))) ?? []

  return (
    <>
      <p><b>Weekly Meetings</b></p>
      <p style={{ fontSize: 12, color: '#828282' }}>Tuesdays, 7:00 PM — 9:00 PM</p>
      <hr />

      {upcoming.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>UPCOMING</p>
          <MeetingTable events={upcoming} checkedInIds={checkedInIds} now={now} />
        </>
      )}

      {past.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4, marginTop: 16 }}>PAST</p>
          <MeetingTable events={past} checkedInIds={checkedInIds} now={now} dim />
        </>
      )}

      {(events?.length ?? 0) === 0 && (
        <p style={{ color: '#828282', fontSize: 12 }}>No meetings scheduled yet.</p>
      )}
    </>
  )
}

function MeetingTable({ events, checkedInIds, now, dim }: { events: Event[]; checkedInIds: Set<string>; now: Date; dim?: boolean }) {
  return (
    <table>
      <thead>
        <tr>
          <th>date</th>
          <th>meeting</th>
          <th>status</th>
        </tr>
      </thead>
      <tbody>
        {events.map(event => {
          const eventDate = new Date(event.event_date)
          const isFuture = isBefore(now, eventDate)
          return (
            <tr key={event.id} style={{ opacity: dim ? 0.5 : 1 }}>
              <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>
                {format(eventDate, 'MMM d, yyyy')}
              </td>
              <td>
                <Link href={`/meetings/${event.id}`}>{event.title}</Link>
              </td>
              <td style={{ fontSize: 11 }}>
                {checkedInIds.has(event.id) ? (
                  <span style={{ color: 'green' }}>[attended]</span>
                ) : event.checkin_open ? (
                  <span style={{ color: '#0066cc' }}>[check-in open]</span>
                ) : isFuture ? (
                  <span style={{ color: '#828282' }}>[not opened yet]</span>
                ) : (
                  <span style={{ color: '#999' }}>[closed]</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
