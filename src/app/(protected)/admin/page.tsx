import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalMembers },
    { count: verifiedMembers },
    { count: totalEvents },
    { data: recentMembers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('id, full_name, email, created_at, is_verified').order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <>
      <p><b>Admin Overview</b></p>
      <hr />

      <table style={{ border: 'none', maxWidth: 300 }}>
        <tbody>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 12px 2px 0', fontSize: 12, color: '#666' }}>total members:</td>
            <td style={{ border: 'none', padding: '2px 0' }}><b>{totalMembers ?? 0}</b></td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 12px 2px 0', fontSize: 12, color: '#666' }}>verified:</td>
            <td style={{ border: 'none', padding: '2px 0' }}><b>{verifiedMembers ?? 0}</b></td>
          </tr>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '2px 12px 2px 0', fontSize: 12, color: '#666' }}>events:</td>
            <td style={{ border: 'none', padding: '2px 0' }}><b>{totalEvents ?? 0}</b></td>
          </tr>
        </tbody>
      </table>

      <hr />
      <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>RECENT SIGNUPS</p>
      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>email</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {recentMembers?.map(m => (
            <tr key={m.id}>
              <td>{m.full_name ?? '—'}</td>
              <td style={{ fontSize: 11 }}>{m.email}</td>
              <td style={{ fontSize: 11 }}>
                {m.is_verified
                  ? <span style={{ color: 'green' }}>[verified]</span>
                  : <span style={{ color: '#999' }}>[unverified]</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
