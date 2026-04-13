'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function AdminEventActions({ eventId, checkinOpen }: { eventId: string; checkinOpen: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const res = await fetch('/api/admin/event-toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, checkinOpen: !checkinOpen }),
    })
    if (res.ok) { toast.success(checkinOpen ? 'Closed' : 'Opened'); router.refresh() }
    else toast.error('Failed')
    setLoading(false)
  }

  return (
    <span style={{ fontSize: 11 }}>
      {loading ? '...' : (
        <a onClick={toggle} style={{ cursor: 'pointer' }}>
          {checkinOpen ? 'close check-in' : 'open check-in'}
        </a>
      )}
    </span>
  )
}
