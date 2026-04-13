import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types/database'
import { format } from 'date-fns'
import { AdminMemberActions } from '@/components/admin-member-actions'

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.filter === 'verified') query = query.eq('is_verified', true)
  if (params.filter === 'unverified') query = query.eq('is_verified', false)
  if (params.filter === 'admin') query = query.eq('is_admin', true)

  const { data: members } = await query as { data: Profile[] | null }

  const filtered = members?.filter(m => {
    if (!params.q) return true
    const q = params.q.toLowerCase()
    return m.full_name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  }) ?? []

  const STAGE_LABELS: Record<string, string> = {
    no_idea: 'Exploring', idea: 'Ideating', prototype: 'Building', launched: 'Launched',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-xl font-semibold">Members ({filtered.length})</h1>
        <a
          href="/api/admin/export-members"
          className="text-xs text-zinc-400 hover:text-zinc-700"
        >
          Export CSV →
        </a>
      </div>

      <form className="flex gap-2" method="get">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search name or email..."
          className="text-sm border border-zinc-200 rounded-md px-3 py-1.5 flex-1 outline-none focus:ring-1 focus:ring-zinc-900"
        />
        <select
          name="filter"
          defaultValue={params.filter ?? ''}
          className="text-sm border border-zinc-200 rounded-md px-3 py-1.5 bg-white outline-none focus:ring-1 focus:ring-zinc-900"
        >
          <option value="">All members</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="admin">Admins</option>
        </select>
        <button type="submit" className="text-sm px-3 py-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-700">
          Filter
        </button>
      </form>

      <div className="border border-zinc-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Member</th>
              <th className="text-left px-4 py-2 font-medium">Year / Concentration</th>
              <th className="text-left px-4 py-2 font-medium">Stage</th>
              <th className="text-left px-4 py-2 font-medium">Check-ins</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{m.full_name ?? '—'}</p>
                  <p className="text-xs text-zinc-400">{m.email}</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {[m.class_year && `'${String(m.class_year).slice(2)}`, m.concentration]
                    .filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {m.build_stage ? STAGE_LABELS[m.build_stage] : '—'}
                </td>
                <td className="px-4 py-3 text-zinc-600">{m.checkin_count}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.is_verified ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {m.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AdminMemberActions memberId={m.id} isVerified={m.is_verified} isAdmin={m.is_admin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
