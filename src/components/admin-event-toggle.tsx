'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function AdminEventToggle({
  eventId,
  checkinOpen,
}: {
  eventId: string
  checkinOpen: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const res = await fetch('/api/admin/event-toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, checkinOpen: !checkinOpen }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(checkinOpen ? 'Check-in closed' : 'Check-in opened')
      router.refresh()
    } else {
      toast.error(data.error ?? 'Failed')
    }
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant={checkinOpen ? 'outline' : 'default'}
      onClick={toggle}
      disabled={loading}
      className={checkinOpen ? '' : 'bg-zinc-900 text-white hover:bg-zinc-700'}
    >
      {loading ? '...' : checkinOpen ? 'Close check-in' : 'Open check-in'}
    </Button>
  )
}
