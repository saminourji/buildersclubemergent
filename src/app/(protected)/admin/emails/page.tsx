import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { EmailComposer } from '@/components/email-composer'
import { EmailBlast } from '@/types/database'

export default async function AdminEmailsPage() {
  const supabase = await createClient()
  const { data: blasts } = await supabase
    .from('email_blasts').select('*').order('sent_at', { ascending: false }).limit(20) as { data: EmailBlast[] | null }

  return (
    <>
      <p><b>Email Blasts</b></p>
      <hr />

      <EmailComposer />

      {blasts && blasts.length > 0 && (
        <>
          <hr />
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>SENT</p>
          <table>
            <thead>
              <tr>
                <th>date</th>
                <th>subject</th>
                <th>audience</th>
                <th>recipients</th>
              </tr>
            </thead>
            <tbody>
              {blasts.map(b => (
                <tr key={b.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>{format(new Date(b.sent_at), 'MMM d, yyyy')}</td>
                  <td>{b.subject}</td>
                  <td style={{ fontSize: 11 }}>{b.audience}</td>
                  <td>{b.recipient_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  )
}
