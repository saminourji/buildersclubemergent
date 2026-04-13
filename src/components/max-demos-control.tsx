'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function MaxDemosControl({ eventId, current }: { eventId: string; current: number }) {
  const router = useRouter()

  async function update(value: number) {
    const supabase = createClient()
    await supabase.from('events').update({ max_demos: value }).eq('id', eventId)
    toast.success(`Max demos set to ${value}`)
    router.refresh()
  }

  return (
    <span>
      <b>{current}</b>
      {' '}
      <a onClick={() => update(Math.max(0, current - 1))} style={{ cursor: 'pointer', fontSize: 11 }}>[-]</a>
      {' '}
      <a onClick={() => update(current + 1)} style={{ cursor: 'pointer', fontSize: 11 }}>[+]</a>
    </span>
  )
}
