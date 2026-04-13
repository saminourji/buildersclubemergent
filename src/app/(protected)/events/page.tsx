import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format, isPast } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Event } from '@/types/database'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false }) as { data: Event[] | null }

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('event_id')
    .eq('member_id', user.id)

  const checkedInIds = new Set(checkIns?.map(c => c.event_id) ?? [])

  const upcoming = events?.filter(e => !isPast(new Date(e.event_date))) ?? []
  const past = events?.filter(e => isPast(new Date(e.event_date))) ?? []

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Events</h1>

      {upcoming.length > 0 && (
        <EventSection title="Upcoming" events={upcoming} checkedInIds={checkedInIds} />
      )}

      {past.length > 0 && (
        <EventSection title="Past" events={past} checkedInIds={checkedInIds} dim />
      )}

      {events?.length === 0 && (
        <p className="text-sm text-zinc-400">No events yet.</p>
      )}
    </div>
  )
}

function EventSection({
  title,
  events,
  checkedInIds,
  dim,
}: {
  title: string
  events: Event[]
  checkedInIds: Set<string>
  dim?: boolean
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{title}</h2>
      <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden">
        {events.map(event => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className={`flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors ${dim ? 'opacity-60' : ''}`}
          >
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-zinc-400">
                {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy · h:mm a')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {checkedInIds.has(event.id) && (
                <Badge variant="secondary" className="text-xs">Attended</Badge>
              )}
              {event.checkin_open && !isPast(new Date(event.event_date)) && (
                <Badge className="text-xs bg-green-100 text-green-700 border-0">Check-in open</Badge>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
