import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { Event } from '@/types/database'
import { AdminEventActions } from '@/components/admin-event-actions'

export default async function AdminEventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false }) as { data: Event[] | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Events</h1>
        <Link
          href="/admin/events/new"
          className="text-sm px-3 py-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-700"
        >
          + New event
        </Link>
      </div>

      {events && events.length > 0 ? (
        <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden">
          {events.map(event => (
            <div key={event.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-zinc-400">
                  {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy · h:mm a')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.checkin_open ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  {event.checkin_open ? 'Check-in open' : 'Closed'}
                </span>
                <Link
                  href={`/admin/events/${event.id}`}
                  className="text-xs text-zinc-400 hover:text-zinc-700"
                >
                  Manage →
                </Link>
                <AdminEventActions eventId={event.id} checkinOpen={event.checkin_open} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No events yet. Create your first one.</p>
      )}
    </div>
  )
}
