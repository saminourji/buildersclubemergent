'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function AdminEventActions({ eventId, eventTitle, checkinOpen }: {
  eventId: string; eventTitle: string; checkinOpen: boolean
}) {
  const router = useRouter()

  async function toggleCheckin() {
    const supabase = createClient()
    await supabase.from('events').update({ checkin_open: !checkinOpen }).eq('id', eventId)
    toast.success(checkinOpen ? 'Closed' : 'Opened')
    router.refresh()
  }

  async function deleteMeeting() {
    if (!confirm(`Delete "${eventTitle}"?\n\nThis will remove the meeting, its agenda, and all check-in records. This cannot be undone.`)) return
    if (!confirm(`Really delete "${eventTitle}"? Last chance.`)) return

    const supabase = createClient()
    await supabase.from('agenda_slots').delete().eq('event_id', eventId)
    await supabase.from('check_ins').delete().eq('event_id', eventId)
    await supabase.from('events').delete().eq('id', eventId)
    toast.success('Meeting deleted')
    router.refresh()
  }

  return (
    <span style={{ fontSize: 11 }}>
      <a onClick={toggleCheckin} style={{ cursor: 'pointer' }}>
        {checkinOpen ? 'close check-in' : 'open check-in'}
      </a>
      {' | '}
      <a onClick={deleteMeeting} style={{ cursor: 'pointer', color: '#a52a2a' }}>
        delete
      </a>
    </span>
  )
}
