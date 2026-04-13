'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function CheckInButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCheckIn() {
    setLoading(true)
    const res = await fetch(`/api/checkin/${eventId}`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) { toast.success('Checked in!'); router.refresh() }
    else toast.error(data.error ?? 'Failed')
    setLoading(false)
  }

  return (
    <a onClick={handleCheckIn} style={{ cursor: 'pointer', fontWeight: 'bold', color: '#ff6600' }}>
      {loading ? '[checking in...]' : '[check in now]'}
    </a>
  )
}
