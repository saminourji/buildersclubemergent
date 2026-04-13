'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AdminEventActions({
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
    <DropdownMenu>
      <DropdownMenuTrigger className="text-xs text-zinc-400 hover:text-zinc-700 px-2" disabled={loading}>
        ···
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggle}>
          {checkinOpen ? 'Close check-in' : 'Open check-in'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
