import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { isPast, isBefore } from 'date-fns'
import { Event } from '@/types/database'
import { formatET } from '@/lib/helpers'

export default async function MeetingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: events } = await supabase
    .from('events').select('*')
    .order('event_date', { ascending: false }) as { data: Event[] | null }

  const { data: myCheckIns } = await supabase
    .from('check_ins').select('event_id').eq('member_id', user.id)

  // Fetch all check-ins to get real per-meeting counts
  const { data: allCheckIns } = await supabase
    .from('check_ins').select('event_id')

  const attendeeCounts: Record<string, number> = {}
  for (const ci of allCheckIns ?? []) {
    attendeeCounts[ci.event_id] = (attendeeCounts[ci.event_id] ?? 0) + 1
  }

  const checkedInIds = new Set(myCheckIns?.map(c => c.event_id) ?? [])

  const now = new Date()
  const upcoming = events?.filter(e => !isPast(new Date(e.event_date))) ?? []
  const past = events?.filter(e => isPast(new Date(e.event_date))) ?? []

  return (
    <>
      <p><b>Weekly Meetings</b></p>
      <p style={{ fontSize: 12, color: '#828282' }}>
        Tuesdays, 7:00–9:00 PM · Nelson Center, 4th floor
      </p>
      <hr />

      {upcoming.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>UPCOMING</p>
          <MeetingTable events={upcoming} checkedInIds={checkedInIds} attendeeCounts={attendeeCounts} now={now} />
        </>
      )}

      {past.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4, marginTop: 16 }}>PAST</p>
          <MeetingTable events={past} checkedInIds={checkedInIds} attendeeCounts={attendeeCounts} now={now} dim />
        </>
      )}

      {(events?.length ?? 0) === 0 && (
        <p style={{ color: '#828282', fontSize: 12 }}>No meetings scheduled yet.</p>
      )}
    </>
  )
}

function MeetingTable({ events, checkedInIds, attendeeCounts, now, dim }: {
  events: Event[]
  checkedInIds: Set<string>
  attendeeCounts: Record<string, number>
  now: Date
  dim?: boolean
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>date</th>
          <th>meeting</th>
          <th>attendees</th>
          <th>status</th>
        </tr>
      </thead>
      <tbody>
        {events.map(event => {
          const eventDate = new Date(event.event_date)
          const isFuture = isBefore(now, eventDate)
          const count = attendeeCounts[event.id] ?? 0
          return (
            <tr key={event.id} style={{ opacity: dim ? 0.5 : 1 }}>
              <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>
                {formatET(event.event_date, 'short')}
              </td>
              <td>
                <Link href={`/meetings/${event.id}`}>{event.title}</Link>
              </td>
              <td style={{ fontSize: 11 }}>
                {count > 0
                  ? <Link href={`/meetings/${event.id}`}>{count}</Link>
                  : <span style={{ color: '#ccc' }}>—</span>}
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
