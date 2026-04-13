import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { EmailComposer } from '@/components/email-composer'
import { EmailBlast } from '@/types/database'

export default async function AdminEmailsPage() {
  const supabase = await createClient()

  const { data: blasts } = await supabase
    .from('email_blasts')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(20) as { data: EmailBlast[] | null }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Email blasts</h1>

      <EmailComposer />

      {blasts && blasts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Sent</h2>
          <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden">
            {blasts.map(blast => (
              <div key={blast.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{blast.subject}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {format(new Date(blast.sent_at), 'MMM d, yyyy · h:mm a')} ·{' '}
                      {blast.recipient_count} recipients ·{' '}
                      <span className="capitalize">{blast.audience}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
