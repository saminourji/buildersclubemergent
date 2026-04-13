import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatET } from '@/lib/helpers'

export default async function AdminPage() {
  const supabase = await createClient()

  const { count: totalMembers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: verifiedMembers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true)
  const { count: totalMeetings } = await supabase.from('events').select('*', { count: 'exact', head: true })

  const { data: recentSignups } = await supabase
    .from('profiles').select('full_name, email, created_at')
    .order('created_at', { ascending: false }).limit(5)

  return (
    <>
      <p><b>Admin Overview</b></p>
      <hr />

      <table style={{ border: 'none', maxWidth: 300 }}>
        <tbody>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', fontSize: 12, color: '#666', padding: '2px 12px 2px 0' }}>total members:</td>
            <td style={{ border: 'none', padding: '2px 0' }}><Link href="/admin/members"><b>{totalMembers ?? 0}</b></Link></td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', fontSize: 12, color: '#666', padding: '2px 12px 2px 0' }}>verified:</td>
            <td style={{ border: 'none', padding: '2px 0' }}><b>{verifiedMembers ?? 0}</b></td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', fontSize: 12, color: '#666', padding: '2px 12px 2px 0' }}>meetings:</td>
            <td style={{ border: 'none', padding: '2px 0' }}><Link href="/admin/meetings"><b>{totalMeetings ?? 0}</b></Link></td>
          </tr>
        </tbody>
      </table>

      <hr />
      <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>RECENT SIGNUPS</p>
      {recentSignups && recentSignups.length > 0 ? (
        <table>
          <thead><tr><th>name</th><th>email</th><th>signed up</th></tr></thead>
          <tbody>
            {recentSignups.map((s, i) => (
              <tr key={i}>
                <td>{s.full_name ?? '—'}</td>
                <td style={{ fontSize: 11 }}>{s.email}</td>
                <td style={{ fontSize: 11 }}>{formatET(s.created_at, 'short')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#828282', fontSize: 12 }}>No signups yet.</p>
      )}
    </>
  )
}
