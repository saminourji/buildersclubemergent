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

export function AdminMemberActions({
  memberId,
  isVerified,
  isAdmin,
}: {
  memberId: string
  isVerified: boolean
  isAdmin: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function action(type: string) {
    setLoading(true)
    const res = await fetch('/api/admin/member-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, action: type }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(data.message)
      router.refresh()
    } else {
      toast.error(data.error ?? 'Action failed')
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-xs text-zinc-400 hover:text-zinc-700 px-2" disabled={loading}>
        ···
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => action(isVerified ? 'unverify' : 'verify')}>
          {isVerified ? 'Remove verification' : 'Mark as verified'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => action('manual-checkin')}>
          Add manual check-in
        </DropdownMenuItem>
        {!isAdmin && (
          <DropdownMenuItem onClick={() => action('make-admin')}>
            Make admin
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
