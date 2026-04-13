import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Profile, Event } from '@/types/database'

const STAGE_LABELS: Record<string, string> = {
  no_idea: 'Exploring',
  idea: 'Ideating',
  prototype: 'Building',
  launched: 'Launched',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3) as { data: Event[] | null }

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('event_id')
    .eq('member_id', user.id)

  const checkedInEventIds = new Set(checkIns?.map(c => c.event_id) ?? [])

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          Hey, {profile?.full_name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="text-zinc-500 text-sm">
          {profile?.is_verified
            ? `${profile.checkin_count} meeting${profile.checkin_count !== 1 ? 's' : ''} attended`
            : 'Attend your first meeting to unlock full access'}
        </p>
      </div>

      {!profile?.is_verified && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
          <strong>Your access is limited.</strong> Check in at a meeting to unlock the member directory, resources, and more.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Meetings attended" value={String(profile?.checkin_count ?? 0)} />
        <StatCard label="Build stage" value={STAGE_LABELS[profile?.build_stage ?? ''] ?? '—'} />
        <StatCard label="Status" value={profile?.is_verified ? 'Verified member' : 'Unverified'} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Upcoming</h2>
          <Link href="/events" className="text-xs text-zinc-400 hover:text-zinc-700">View all →</Link>
        </div>
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden">
            {upcomingEvents.map(event => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-zinc-400">{format(new Date(event.event_date), 'EEEE, MMMM d · h:mm a')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {checkedInEventIds.has(event.id) && (
                    <Badge variant="secondary" className="text-xs">Attended</Badge>
                  )}
                  {event.checkin_open && (
                    <Badge className="text-xs bg-green-100 text-green-700 border-0">Check-in open</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">No upcoming events scheduled.</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-100 rounded-lg p-4">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
