import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckinCodeInput } from '@/components/checkin-code-input'
import { formatET } from '@/lib/helpers'

export default async function CheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/checkin/${token}`)

  const { data: event } = await supabase
    .from('events').select('*')
    .or(`qr_token.eq.${token},id.eq.${token}`).single()

  const { data: existing } = await supabase
    .from('check_ins').select('id')
    .eq('member_id', user.id).eq('event_id', event?.id ?? '').single()

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <table style={{ border: '1px solid #b0c4d8', width: '100%', background: '#fff' }}>
        <tbody>
          <tr>
            <td style={{ background: '#87CEEB', padding: '4px 8px', border: 'none' }}>
              <b style={{ color: '#000' }}>Check-in</b>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '20px', border: 'none', textAlign: 'center' }}>
              {!event ? (
                <p>Meeting not found. Invalid code.</p>
              ) : existing ? (
                <>
                  <p>You already checked in to <b>{event.title}</b>.</p>
                  <p style={{ color: 'green', marginTop: 8 }}>[attended]</p>
                </>
              ) : !event.checkin_open ? (
                <p>Check-in for <b>{event.title}</b> is closed.</p>
              ) : (
                <>
                  <p style={{ fontSize: 11, color: '#828282' }}>CHECK IN TO</p>
                  <p style={{ fontSize: 16 }}><b>{event.title}</b></p>
                  <p style={{ fontSize: 12, color: '#828282', marginBottom: 12 }}>
                    {formatET(event.event_date, 'full')}
                  </p>
                  <CheckinCodeInput eventId={event.id} expectedCode={event.qr_token} />
                </>
              )}
              <p style={{ marginTop: 16 }}>
                <a href="/dashboard" style={{ fontSize: 11 }}>back to dashboard</a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
