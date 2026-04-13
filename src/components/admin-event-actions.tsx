'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function AdminEventActions({ eventId, checkinOpen }: { eventId: string; checkinOpen: boolean }) {
  const router = useRouter()

  async function toggleCheckin() {
    const supabase = createClient()
    await supabase.from('events').update({ checkin_open: !checkinOpen }).eq('id', eventId)
    toast.success(checkinOpen ? 'Closed' : 'Opened')
    router.refresh()
  }

  return (
    <span style={{ fontSize: 11 }}>
      <a onClick={toggleCheckin} style={{ cursor: 'pointer' }}>
        {checkinOpen ? 'close check-in' : 'open check-in'}
      </a>
    </span>
  )
}
