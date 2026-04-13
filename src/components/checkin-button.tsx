'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useState } from 'react'

export function CheckInButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function checkin() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('check_ins').insert({ member_id: user.id, event_id: eventId })
    if (error) {
      if (error.code === '23505') toast.info('Already checked in')
      else toast.error('Failed to check in')
    } else {
      toast.success('Checked in!')
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <a onClick={checkin} style={{ cursor: 'pointer', fontWeight: 'bold', color: '#0066cc' }}>
      {loading ? 'checking in...' : '[check in now]'}
    </a>
  )
}
