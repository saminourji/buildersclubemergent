import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MemberCard } from '@/components/member-card'
import { Profile } from '@/types/database'

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; area?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: me } = await supabase
    .from('profiles')
    .select('is_verified')
    .eq('id', user.id)
    .single()

  if (!me?.is_verified) {
    redirect('/dashboard')
  }

  const params = await searchParams
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('onboarding_complete', true)
    .order('created_at', { ascending: false })

  if (params.stage) query = query.eq('build_stage', params.stage)
  if (params.area) query = query.eq('interest_area', params.area)

  const { data: members } = await query as { data: Profile[] | null }

  const filtered = members?.filter(m => {
    if (!params.q) return true
    const q = params.q.toLowerCase()
    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.project_name?.toLowerCase().includes(q) ||
      m.concentration?.toLowerCase().includes(q) ||
      m.interest_area?.toLowerCase().includes(q)
    )
  }) ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Directory</h1>
          <p className="text-sm text-zinc-400 mt-1">{filtered.length} members</p>
        </div>
      </div>

      <DirectoryFilters currentStage={params.stage} currentArea={params.area} q={params.q} />

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">No members match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => (
            <MemberCard key={m.id} member={m} isMe={m.id === user.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function DirectoryFilters({
  currentStage,
  currentArea,
  q,
}: {
  currentStage?: string
  currentArea?: string
  q?: string
}) {
  const stages = [
    { value: '', label: 'All stages' },
    { value: 'no_idea', label: 'Exploring' },
    { value: 'idea', label: 'Ideating' },
    { value: 'prototype', label: 'Building' },
    { value: 'launched', label: 'Launched' },
  ]

  return (
    <form className="flex flex-wrap gap-2 items-center" method="get">
      <input
        name="q"
        defaultValue={q}
        placeholder="Search members..."
        className="text-sm border border-zinc-200 rounded-md px-3 py-1.5 w-44 outline-none focus:ring-1 focus:ring-zinc-900"
      />
      <select
        name="stage"
        defaultValue={currentStage ?? ''}
        className="text-sm border border-zinc-200 rounded-md px-3 py-1.5 outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
      >
        {stages.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button
        type="submit"
        className="text-sm px-3 py-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-700"
      >
        Filter
      </button>
      {(currentStage || currentArea || q) && (
        <a href="/directory" className="text-xs text-zinc-400 hover:text-zinc-700">Clear</a>
      )}
    </form>
  )
}
