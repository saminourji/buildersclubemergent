import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckInButton } from '@/components/checkin-button'
import { format } from 'date-fns'

export default async function CheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/checkin/${token}`)
  }

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .or(`qr_token.eq.${token},id.eq.${token}`)
    .single()

  const { data: existing } = await supabase
    .from('check_ins')
    .select('id')
    .eq('member_id', user.id)
    .eq('event_id', event?.id ?? '')
    .single()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        {!event ? (
          <>
            <p className="text-4xl">🔍</p>
            <h1 className="text-xl font-semibold">Event not found</h1>
            <p className="text-sm text-zinc-400">This QR code doesn&apos;t match any event.</p>
          </>
        ) : existing ? (
          <>
            <p className="text-4xl">✓</p>
            <h1 className="text-xl font-semibold">Already checked in</h1>
            <p className="text-sm text-zinc-400">
              You&apos;ve already checked in to <strong>{event.title}</strong>.
            </p>
          </>
        ) : !event.checkin_open ? (
          <>
            <p className="text-4xl">🔒</p>
            <h1 className="text-xl font-semibold">Check-in is closed</h1>
            <p className="text-sm text-zinc-400">
              Check-in for <strong>{event.title}</strong> is not currently open.
            </p>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 uppercase tracking-widest">Check in to</p>
              <h1 className="text-2xl font-semibold">{event.title}</h1>
              <p className="text-sm text-zinc-400">
                {format(new Date(event.event_date), 'EEEE, MMMM d · h:mm a')}
              </p>
            </div>
            <CheckInButton eventId={event.id} />
          </>
        )}

        <a href="/dashboard" className="block text-xs text-zinc-400 hover:text-zinc-700">
          Back to dashboard →
        </a>
      </div>
    </div>
  )
}
