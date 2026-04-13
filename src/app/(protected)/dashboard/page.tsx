import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { Profile, Event } from '@/types/database'

const STAGE_LABELS: Record<string, string> = {
  no_idea: 'exploring', idea: 'ideating', prototype: 'building', launched: 'launched',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(5) as { data: Event[] | null }

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('event_id')
    .eq('member_id', user.id)

  const checkedInIds = new Set(checkIns?.map(c => c.event_id) ?? [])

  return (
    <>
      <p>
        <b>Welcome, {profile?.full_name?.split(' ')[0] ?? 'builder'}.</b>
        {' '}
        {profile?.is_verified
          ? `You have attended ${profile.checkin_count} meeting${profile.checkin_count !== 1 ? 's' : ''}.`
          : 'You have not attended any meetings yet.'}
      </p>

      {!profile?.is_verified && (
        <>
          <hr />
          <p style={{ color: '#a52a2a', fontSize: 12 }}>
            <b>Notice:</b> Your access is limited. Attend a meeting (check in with QR code) to unlock the member directory and resources.
          </p>
        </>
      )}

      <hr />

      <table style={{ border: 'none', width: '100%' }}>
        <tbody>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 0', width: 120, fontSize: 12, color: '#666' }}>status:</td>
            <td style={{ border: 'none', padding: '2px 0' }}>{profile?.is_verified ? 'verified member' : 'unverified'}</td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 0', fontSize: 12, color: '#666' }}>meetings:</td>
            <td style={{ border: 'none', padding: '2px 0' }}>{profile?.checkin_count ?? 0}</td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 0', fontSize: 12, color: '#666' }}>build stage:</td>
            <td style={{ border: 'none', padding: '2px 0' }}>{STAGE_LABELS[profile?.build_stage ?? ''] ?? '—'}</td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 0', fontSize: 12, color: '#666' }}>interest:</td>
            <td style={{ border: 'none', padding: '2px 0' }}>{profile?.interest_area ?? '—'}</td>
          </tr>
          {profile?.project_name && (
            <tr style={{ background: 'transparent' }}>
              <td style={{ border: 'none', padding: '2px 0', fontSize: 12, color: '#666' }}>project:</td>
              <td style={{ border: 'none', padding: '2px 0' }}>
                {profile.project_url ? (
                  <a href={profile.project_url} target="_blank" rel="noopener noreferrer">{profile.project_name}</a>
                ) : profile.project_name}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <hr />

      <p><b>Upcoming meetings</b></p>
      {upcomingEvents && upcomingEvents.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>date</th>
              <th>event</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {upcomingEvents.map(event => (
              <tr key={event.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>
                  {format(new Date(event.event_date), 'MMM d, h:mm a')}
                </td>
                <td>
                  <Link href={`/events/${event.id}`}>{event.title}</Link>
                </td>
                <td style={{ fontSize: 11 }}>
                  {checkedInIds.has(event.id) ? (
                    <span style={{ color: 'green' }}>[attended]</span>
                  ) : event.checkin_open ? (
                    <span style={{ color: '#ff6600' }}>[check-in open]</span>
                  ) : (
                    <span style={{ color: '#999' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: 12, color: '#828282' }}>No upcoming events scheduled.</p>
      )}
    </>
  )
}
