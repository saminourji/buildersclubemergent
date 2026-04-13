import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AgendaSlotView } from '@/components/agenda-slot-view'
import { CheckInButton } from '@/components/checkin-button'
import { Event, AgendaSlot } from '@/types/database'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single() as { data: Event | null }

  if (!event) notFound()

  const { data: slots } = await supabase
    .from('agenda_slots')
    .select('*')
    .eq('event_id', id)
    .order('slot_order', { ascending: true }) as { data: AgendaSlot[] | null }

  const { data: checkIn } = await supabase
    .from('check_ins')
    .select('id')
    .eq('member_id', user.id)
    .eq('event_id', id)
    .single()

  const alreadyCheckedIn = !!checkIn

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const approvedSlots = profile?.is_admin
    ? (slots ?? [])
    : (slots ?? []).filter(s => s.approved)

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          {event.checkin_open && !alreadyCheckedIn && (
            <CheckInButton eventId={event.id} />
          )}
          {alreadyCheckedIn && (
            <Badge className="shrink-0 bg-green-50 text-green-700 border-0">Attended ✓</Badge>
          )}
        </div>
        <p className="text-sm text-zinc-500">
          {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy · h:mm a')}
        </p>
        {event.description && (
          <p className="text-sm text-zinc-600">{event.description}</p>
        )}
      </div>

      {approvedSlots.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Agenda</h2>
            <div className="space-y-3">
              {approvedSlots.map(slot => (
                <AgendaSlotView key={slot.id} slot={slot} />
              ))}
            </div>
          </div>
        </>
      )}

      {event.checkin_open && (
        <>
          <Separator />
          <DemoSignup eventId={event.id} userId={user.id} />
        </>
      )}
    </div>
  )
}

async function DemoSignup({ eventId, userId }: { eventId: string; userId: string }) {
  const supabase = await createClient()
  const { data: mySlot } = await supabase
    .from('agenda_slots')
    .select('id, approved')
    .eq('event_id', eventId)
    .eq('presenter_id', userId)
    .eq('slot_type', 'demo')
    .single()

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Demo sign-up</h2>
      {mySlot ? (
        <p className="text-sm text-zinc-500">
          You&apos;re signed up to demo.{' '}
          {mySlot.approved ? (
            <span className="text-green-700 font-medium">Approved ✓</span>
          ) : (
            <span className="text-amber-600">Pending approval</span>
          )}
        </p>
      ) : (
        <DemoSignupForm eventId={eventId} userId={userId} />
      )}
    </div>
  )
}

function DemoSignupForm({ eventId, userId }: { eventId: string; userId: string }) {
  return (
    <form action="/api/demo-signup" method="post" className="space-y-3">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="presenter_id" value={userId} />
      <div className="flex gap-2">
        <input
          name="title"
          placeholder="What are you demoing?"
          required
          className="flex-1 text-sm border border-zinc-200 rounded-md px-3 py-1.5 outline-none focus:ring-1 focus:ring-zinc-900"
        />
        <button
          type="submit"
          className="text-sm px-3 py-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 whitespace-nowrap"
        >
          Sign up
        </button>
      </div>
    </form>
  )
}
