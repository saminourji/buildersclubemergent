import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { Profile, Event, AgendaSlot } from '@/types/database'

const STAGE_LABELS: Record<string, string> = {
  no_idea: 'exploring', idea: 'ideating', prototype: 'building', launched: 'launched',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single() as { data: Profile | null }

  const { data: upcomingEvents } = await supabase
    .from('events').select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(5) as { data: Event[] | null }

  const { data: checkIns } = await supabase
    .from('check_ins').select('event_id').eq('member_id', user.id)

  const checkedInIds = new Set(checkIns?.map(c => c.event_id) ?? [])

  const nextMeeting = upcomingEvents?.[0] ?? null
  let nextMeetingSlots: AgendaSlot[] = []
  let nextDemoCount = 0
  if (nextMeeting) {
    const { data: slots } = await supabase
      .from('agenda_slots').select('*').eq('event_id', nextMeeting.id).eq('approved', true)
      .order('slot_order', { ascending: true })
    nextMeetingSlots = (slots ?? []) as AgendaSlot[]
    nextDemoCount = nextMeetingSlots.filter(s => s.slot_type === 'demo').length
  }

  return (
    <>
      <p style={{ fontSize: 15 }}>
        <b>Hey {profile?.full_name?.split(' ')[0] ?? 'builder'} 👋</b>
      </p>
      <p style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
        Welcome to Builders Club. We meet Tuesdays, 7–9 PM.
      </p>

      {!profile?.is_verified && (
        <>
          <hr />
          <div style={{ border: '1px solid #d4a574', background: '#fef9f0', padding: '8px 12px' }}>
            <p style={{ fontSize: 12, color: '#8b5e3c' }}>
              <b>📋 First time?</b> Come to a meeting and enter the check-in code to unlock the member directory, resources, and Slack.
            </p>
          </div>
        </>
      )}

      {/* Next meeting highlight */}
      {nextMeeting && (
        <>
          <hr />
          <div style={{ border: '1px solid #b0c4d8', background: '#fff', padding: '12px' }}>
            <p style={{ fontSize: 11, color: '#828282', marginBottom: 2 }}>NEXT MEETING</p>
            <p style={{ fontSize: 14 }}>
              <b><Link href={`/meetings/${nextMeeting.id}`}>{nextMeeting.title}</Link></b>
            </p>
            <p style={{ fontSize: 12, color: '#666' }}>
              {format(new Date(nextMeeting.event_date), 'EEEE, MMMM d — h:mm a')}
              {' · '}
              <span style={{ color: '#0066cc' }}>
                {formatDistanceToNow(new Date(nextMeeting.event_date), { addSuffix: true })}
              </span>
            </p>
            {nextMeeting.description && (
              <p style={{ fontSize: 12, marginTop: 6 }}>{nextMeeting.description}</p>
            )}

            {nextMeetingSlots.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 11, color: '#828282' }}>agenda:</p>
                {nextMeetingSlots.map(slot => (
                  <p key={slot.id} style={{ fontSize: 11, paddingLeft: 8 }}>
                    <span style={{ fontFamily: 'monospace', color: '#828282' }}>
                      [{slot.slot_type === 'demo' ? 'DEMO' : slot.slot_type === 'speaker' ? 'SPEAKER' : 'ANNOUNCE'}]
                    </span>
                    {' '}{slot.title}
                    {slot.presenter_name && <span style={{ color: '#666' }}> — {slot.presenter_name}</span>}
                  </p>
                ))}
              </div>
            )}

            <div style={{ marginTop: 10, fontSize: 12 }}>
              {nextMeeting.checkin_open ? (
                <span style={{ color: '#0066cc' }}>✓ Check-in is open — <Link href={`/meetings/${nextMeeting.id}`}>enter code</Link></span>
              ) : (
                <span style={{ color: '#828282' }}>Check-in not opened yet</span>
              )}
              {nextDemoCount < 3 && (
                <>
                  {' · '}
                  <Link href={`/meetings/${nextMeeting.id}`}>request a demo slot</Link>
                  <span style={{ color: '#828282' }}> ({3 - nextDemoCount} left)</span>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <hr />

      <table style={{ border: 'none', width: '100%' }}>
        <tbody>
          <Stat label="status" value={profile?.is_verified ? 'verified member ✓' : 'unverified — attend a meeting!'} />
          <Stat label="meetings attended" value={String(profile?.checkin_count ?? 0)} />
          <Stat label="build stage" value={STAGE_LABELS[profile?.build_stage ?? ''] ?? '—'} />
          <Stat label="interests" value={profile?.interest_area?.join(', ') || '—'} />
          {profile?.project_name && (
            <Stat label="project" value={profile.project_url
              ? `<a href="${profile.project_url}" target="_blank">${profile.project_name}</a>`
              : profile.project_name} html />
          )}
        </tbody>
      </table>

      {/* Other upcoming meetings */}
      {upcomingEvents && upcomingEvents.length > 1 && (
        <>
          <hr />
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>MORE UPCOMING</p>
          <table>
            <thead>
              <tr><th>date</th><th>meeting</th><th>status</th></tr>
            </thead>
            <tbody>
              {upcomingEvents.slice(1).map(event => (
                <tr key={event.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>
                    {format(new Date(event.event_date), 'MMM d')}
                  </td>
                  <td><Link href={`/meetings/${event.id}`}>{event.title}</Link></td>
                  <td style={{ fontSize: 11 }}>
                    {checkedInIds.has(event.id) ? (
                      <span style={{ color: 'green' }}>[attended]</span>
                    ) : event.checkin_open ? (
                      <span style={{ color: '#0066cc' }}>[check-in open]</span>
                    ) : (
                      <span style={{ color: '#828282' }}>[not opened yet]</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  )
}

function Stat({ label, value, html }: { label: string; value: string; html?: boolean }) {
  return (
    <tr style={{ background: 'transparent' }}>
      <td style={{ border: 'none', padding: '2px 0', width: 140, fontSize: 12, color: '#666' }}>{label}:</td>
      <td style={{ border: 'none', padding: '2px 0' }}
        {...(html ? { dangerouslySetInnerHTML: { __html: value } } : { children: value })}
      />
    </tr>
  )
}
