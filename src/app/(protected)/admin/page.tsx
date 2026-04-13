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
    supabase.from('profiles').select('id, full_name, email, created_at, is_verified').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin overview</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total members" value={String(totalMembers ?? 0)} />
        <StatCard label="Verified members" value={String(verifiedMembers ?? 0)} />
        <StatCard label="Events" value={String(totalEvents ?? 0)} />
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Recent signups</h2>
        <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden">
          {recentMembers?.map(m => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{m.full_name ?? '—'}</p>
                <p className="text-xs text-zinc-400">{m.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.is_verified ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                {m.is_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-100 rounded-lg p-4">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}
