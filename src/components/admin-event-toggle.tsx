'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function AdminEventToggle({ eventId, checkinOpen }: { eventId: string; checkinOpen: boolean }) {
  const router = useRouter()

  async function toggle() {
    const supabase = createClient()
    await supabase.from('events').update({ checkin_open: !checkinOpen }).eq('id', eventId)
    toast.success(checkinOpen ? 'Closed' : 'Opened')
    router.refresh()
  }

  return (
    <span>
      {checkinOpen
        ? <span style={{ color: 'green' }}>open</span>
        : <span style={{ color: '#999' }}>closed</span>}
      {' '}
      <a onClick={toggle} style={{ cursor: 'pointer', fontSize: 11 }}>
        [{checkinOpen ? 'close' : 'open'}]
      </a>
    </span>
  )
}
