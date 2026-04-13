'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function CheckInButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCheckIn() {
    setLoading(true)
    const res = await fetch(`/api/checkin/${eventId}`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      toast.success('Checked in!')
      router.refresh()
    } else {
      toast.error(data.error ?? 'Check-in failed')
    }
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      className="shrink-0 bg-zinc-900 text-white hover:bg-zinc-700"
      onClick={handleCheckIn}
      disabled={loading}
    >
      {loading ? 'Checking in...' : 'Check in'}
    </Button>
  )
}
