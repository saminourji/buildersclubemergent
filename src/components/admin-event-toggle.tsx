'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function AdminEventToggle({ eventId, checkinOpen }: { eventId: string; checkinOpen: boolean }) {
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
    <span>
      {checkinOpen
        ? <span style={{ color: '#ff6600' }}>[open]</span>
        : <span style={{ color: '#999' }}>[closed]</span>}
      {' '}
      <a onClick={toggle} style={{ cursor: 'pointer', fontSize: 11 }}>
        {loading ? '...' : checkinOpen ? '(close)' : '(open)'}
      </a>
    </span>
  )
}
