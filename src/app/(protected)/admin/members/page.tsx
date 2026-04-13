import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types/database'
import { AdminMemberActions } from '@/components/admin-member-actions'

const STAGE_LABELS: Record<string, string> = {
  no_idea: 'exploring', idea: 'ideating', prototype: 'building', launched: 'launched',
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (params.filter === 'verified') query = query.eq('is_verified', true)
  if (params.filter === 'unverified') query = query.eq('is_verified', false)
  if (params.filter === 'admin') query = query.eq('is_admin', true)

  const { data: members } = await query as { data: Profile[] | null }

  const filtered = members?.filter(m => {
    if (!params.q) return true
    const q = params.q.toLowerCase()
    return m.full_name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  }) ?? []

  return (
    <>
      <p><b>Members</b> ({filtered.length})</p>
      <hr />

      <form method="get" style={{ marginBottom: 12 }}>
        <input name="q" defaultValue={params.q} placeholder="search..." style={{ width: 200, marginRight: 4 }} />
        <select name="filter" defaultValue={params.filter ?? ''} style={{ marginRight: 4 }}>
          <option value="">all</option>
          <option value="verified">verified</option>
          <option value="unverified">unverified</option>
          <option value="admin">admins</option>
        </select>
        <button type="submit" style={{ background: '#e8e8df', border: '1px solid #999', padding: '2px 10px', cursor: 'pointer' }}>go</button>
        {(params.q || params.filter) && <> <a href="/admin/members" style={{ fontSize: 11 }}>clear</a></>}
      </form>

      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>email</th>
            <th>year</th>
            <th>stage</th>
            <th>check-ins</th>
            <th>status</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.id}>
              <td>{m.full_name ?? '—'}</td>
              <td style={{ fontSize: 11 }}>{m.email}</td>
              <td>{m.class_year ? `'${String(m.class_year).slice(2)}` : '—'}</td>
              <td style={{ fontSize: 11 }}>{m.build_stage ? STAGE_LABELS[m.build_stage] : '—'}</td>
              <td>{m.checkin_count}</td>
              <td style={{ fontSize: 11 }}>
                {m.is_admin && <span style={{ color: '#ff6600' }}>[admin] </span>}
                {m.is_verified
                  ? <span style={{ color: 'green' }}>[verified]</span>
                  : <span style={{ color: '#999' }}>[unverified]</span>}
              </td>
              <td>
                <AdminMemberActions memberId={m.id} isVerified={m.is_verified} isAdmin={m.is_admin} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
