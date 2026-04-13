import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Profile } from '@/types/database'
import { formatClassYear } from '@/lib/helpers'

const STAGE_LABELS: Record<string, string> = {
  no_idea: 'exploring', idea: 'ideating', prototype: 'building', launched: 'launched',
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: me } = await supabase.from('profiles').select('is_verified').eq('id', user.id).single()
  if (!me?.is_verified) redirect('/dashboard')

  const params = await searchParams
  let query = supabase.from('profiles').select('*').eq('onboarding_complete', true).order('full_name', { ascending: true })
  if (params.stage) query = query.eq('build_stage', params.stage)

  const { data: members } = await query as { data: Profile[] | null }

  const filtered = members?.filter(m => {
    if (!params.q) return true
    const q = params.q.toLowerCase()
    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.project_name?.toLowerCase().includes(q) ||
      m.concentration?.toLowerCase().includes(q)
    )
  }) ?? []

  return (
    <>
      <p><b>Member Directory</b> ({filtered.length} members)</p>
      <hr />

      <form method="get" style={{ marginBottom: 12 }}>
        <input name="q" defaultValue={params.q} placeholder="search..." style={{ width: 200, marginRight: 4 }} />
        <select name="stage" defaultValue={params.stage ?? ''} style={{ marginRight: 4 }}>
          <option value="">all stages</option>
          <option value="no_idea">exploring</option>
          <option value="idea">ideating</option>
          <option value="prototype">building</option>
          <option value="launched">launched</option>
        </select>
        <button type="submit" style={{ background: '#d4e6f1', border: '1px solid #b0c4d8', padding: '2px 10px', cursor: 'pointer' }}>go</button>
        {(params.stage || params.q) && <> <a href="/directory" style={{ fontSize: 11 }}>clear</a></>}
      </form>

      {filtered.length === 0 ? (
        <p style={{ color: '#828282', fontSize: 12 }}>No members match your search.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>name</th>
              <th>year</th>
              <th>concentration</th>
              <th>interests</th>
              <th>stage</th>
              <th>project</th>
              <th>contact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: m.id === user.id ? 'bold' : 'normal' }}>
                  {m.full_name ?? '—'}
                  {m.id === user.id && <span style={{ color: '#828282' }}> (you)</span>}
                </td>
                <td>{formatClassYear(m.class_year)}</td>
                <td>{m.concentration ?? '—'}</td>
                <td style={{ fontSize: 11 }}>{m.interest_area?.join(', ') || '—'}</td>
                <td style={{ fontSize: 11 }}>{m.build_stage ? STAGE_LABELS[m.build_stage] : '—'}</td>
                <td>
                  {m.project_name ? (
                    m.project_url ? <a href={m.project_url} target="_blank" rel="noopener noreferrer">{m.project_name}</a> : m.project_name
                  ) : '—'}
                </td>
                <td style={{ fontSize: 11 }}><a href={`mailto:${m.email}`}>email</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
