import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Event, AgendaSlot } from '@/types/database'
import { QRDisplay } from '@/components/qr-display'
import { AdminEventToggle } from '@/components/admin-event-toggle'
import { AdminAgendaManager } from '@/components/admin-agenda-manager'

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

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

  const { count: checkinCount } = await supabase
    .from('check_ins')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  const checkinUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkin/${event.qr_token}`

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{event.title}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy · h:mm a')}
          </p>
        </div>
        <AdminEventToggle eventId={event.id} checkinOpen={event.checkin_open} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-zinc-100 rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Check-ins</p>
          <p className="text-2xl font-semibold">{checkinCount ?? 0}</p>
        </div>
        <div className="border border-zinc-100 rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Status</p>
          <p className="text-lg font-semibold">{event.checkin_open ? 'Open' : 'Closed'}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">QR Check-in</h2>
        <QRDisplay url={checkinUrl} token={event.qr_token} />
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Agenda</h2>
        <AdminAgendaManager eventId={event.id} slots={slots ?? []} />
      </div>
    </div>
  )
}
