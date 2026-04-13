import { createClient } from '@/lib/supabase/server'
import { Profile, Event, CheckIn } from '@/types/database'
import { formatClassYear } from '@/lib/helpers'
import { format } from 'date-fns'
import { AdminMemberActions } from '@/components/admin-member-actions'

const STAGE_LABELS: Record<string, string> = {
  no_idea: 'exploring', idea: 'ideating', prototype: 'building', launched: 'launched',
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; detail?: string }>
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

  // If detail view requested, load attendance for that member
  let detailMember: Profile | null = null
  let detailAttendance: { event_title: string; event_date: string }[] = []
  if (params.detail) {
    detailMember = filtered.find(m => m.id === params.detail) ?? null
    if (detailMember) {
      const { data: checkins } = await supabase
        .from('check_ins').select('event_id, checked_in_at').eq('member_id', params.detail)
      if (checkins && checkins.length > 0) {
        const eventIds = checkins.map(c => c.event_id)
        const { data: events } = await supabase
          .from('events').select('id, title, event_date').in('id', eventIds).order('event_date', { ascending: false })
        detailAttendance = events?.map(e => ({ event_title: e.title, event_date: e.event_date })) ?? []
      }
    }
  }

  return (
    <>
      <p><b>Members</b> ({filtered.length})</p>
      <hr />

      <form method="get" style={{ marginBottom: 12 }}>
        <input name="q" defaultValue={params.q} placeholder="search..." style={{ width: 200, marginRight: 4 }} />
        <select name="filter" defaultValue={params.filter ?? ''} style={{ marginRight: 4 }}>
          <option value="">all</option><option value="verified">verified</option>
          <option value="unverified">unverified</option><option value="admin">admins</option>
        </select>
        <button type="submit" style={{ background: '#d4e6f1', border: '1px solid #b0c4d8', padding: '2px 10px', cursor: 'pointer' }}>go</button>
        {(params.q || params.filter) && <> <a href="/admin/members" style={{ fontSize: 11 }}>clear</a></>}
      </form>

      {detailMember && (
        <div style={{ border: '1px solid #b0c4d8', background: '#fff', padding: 12, marginBottom: 12 }}>
          <p><b>Attendance: {detailMember.full_name ?? detailMember.email}</b> <a href="/admin/members" style={{ fontSize: 11 }}>[close]</a></p>
          {detailAttendance.length > 0 ? (
            <ul style={{ paddingLeft: 20, listStyleType: 'disc', marginTop: 8 }}>
              {detailAttendance.map((a, i) => (
                <li key={i} style={{ fontSize: 12 }}>
                  {a.event_title} — {format(new Date(a.event_date), 'MMM d, yyyy')}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 12, color: '#828282', marginTop: 4 }}>No meetings attended.</p>
          )}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>name</th><th>email</th><th>year</th><th>stage</th><th>meetings</th><th>status</th><th>actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.id}>
              <td>{m.full_name ?? '—'}</td>
              <td style={{ fontSize: 11 }}>{m.email}</td>
              <td>{formatClassYear(m.class_year)}</td>
              <td style={{ fontSize: 11 }}>{m.build_stage ? STAGE_LABELS[m.build_stage] : '—'}</td>
              <td>
                <a href={`/admin/members?detail=${m.id}${params.q ? `&q=${params.q}` : ''}${params.filter ? `&filter=${params.filter}` : ''}`}>
                  {m.checkin_count} attended
                </a>
              </td>
              <td style={{ fontSize: 11 }}>
                {m.is_admin && <span style={{ color: '#0066cc' }}>[admin] </span>}
                {m.is_verified
                  ? <span style={{ color: 'green' }}>[verified]</span>
                  : <span style={{ color: '#999' }}>[unverified]</span>}
              </td>
              <td><AdminMemberActions memberId={m.id} memberName={m.full_name ?? m.email} isVerified={m.is_verified} isAdmin={m.is_admin} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
