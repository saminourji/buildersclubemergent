import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Event, AgendaSlot } from '@/types/database'
import { formatET } from '@/lib/helpers'
import { CheckinCodeDisplay } from '@/components/checkin-code-display'
import { AdminEventToggle } from '@/components/admin-event-toggle'
import { AdminAgendaManager } from '@/components/admin-agenda-manager'
import { MaxDemosControl } from '@/components/max-demos-control'

export default async function AdminMeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events').select('*').eq('id', id).single() as { data: Event | null }
  if (!event) notFound()

  const { data: slots } = await supabase
    .from('agenda_slots').select('*').eq('event_id', id)
    .order('slot_order', { ascending: true }) as { data: AgendaSlot[] | null }

  const { count: checkinCount } = await supabase
    .from('check_ins').select('*', { count: 'exact', head: true }).eq('event_id', id)

  const { data: attendeeCheckins } = await supabase
    .from('check_ins').select('member_id').eq('event_id', id)
  const attendeeIds = attendeeCheckins?.map(c => c.member_id) ?? []
  let attendees: { full_name: string | null; email: string }[] = []
  if (attendeeIds.length > 0) {
    const { data } = await supabase.from('profiles').select('full_name, email').in('id', attendeeIds)
    attendees = data ?? []
  }

  const totalMinutes = (slots ?? []).filter(s => s.approved).reduce((sum, s) => sum + (s.estimated_minutes ?? 5), 0)

  return (
    <>
      <p><b>{event.title}</b></p>
      <p style={{ fontSize: 12, color: '#828282' }}>{formatET(event.event_date, 'full')} · Nelson Center, 4th floor</p>
      <hr />

      <table style={{ border: 'none', maxWidth: 350 }}>
        <tbody>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 12px 2px 0', fontSize: 12, color: '#666' }}>check-ins:</td>
            <td style={{ border: 'none', padding: '2px 0' }}><b>{checkinCount ?? 0}</b></td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 12px 2px 0', fontSize: 12, color: '#666' }}>status:</td>
            <td style={{ border: 'none', padding: '2px 0' }}><AdminEventToggle eventId={event.id} checkinOpen={event.checkin_open} /></td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 12px 2px 0', fontSize: 12, color: '#666' }}>max demos:</td>
            <td style={{ border: 'none', padding: '2px 0' }}><MaxDemosControl eventId={event.id} current={event.max_demos ?? 3} /></td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 12px 2px 0', fontSize: 12, color: '#666' }}>est. time:</td>
            <td style={{ border: 'none', padding: '2px 0' }}>{totalMinutes} min</td>
          </tr>
        </tbody>
      </table>

      <hr />
      <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>CHECK-IN CODE</p>
      <CheckinCodeDisplay code={event.qr_token} />

      <hr />
      <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>AGENDA</p>
      <AdminAgendaManager eventId={event.id} slots={slots ?? []} maxDemos={event.max_demos ?? 3} />

      {attendees.length > 0 && (
        <>
          <hr />
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>ATTENDEES ({attendees.length})</p>
          <ul style={{ paddingLeft: 20, listStyleType: 'disc' }}>
            {attendees.map((a, i) => (
              <li key={i} style={{ fontSize: 12 }}>{a.full_name ?? a.email}</li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
