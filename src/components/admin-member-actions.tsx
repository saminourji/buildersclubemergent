'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function AdminMemberActions({ memberId, isVerified, isAdmin }: {
  memberId: string; isVerified: boolean; isAdmin: boolean
}) {
  const router = useRouter()

  async function toggleVerified() {
    const supabase = createClient()
    await supabase.from('profiles').update({ is_verified: !isVerified }).eq('id', memberId)
    toast.success(isVerified ? 'Unverified' : 'Verified')
    router.refresh()
  }

  async function toggleAdmin() {
    const supabase = createClient()
    await supabase.from('profiles').update({ is_admin: !isAdmin }).eq('id', memberId)
    toast.success(isAdmin ? 'Removed admin' : 'Made admin')
    router.refresh()
  }

  return (
    <span style={{ fontSize: 11 }}>
      <a onClick={toggleVerified} style={{ cursor: 'pointer' }}>
        {isVerified ? 'unverify' : 'verify'}
      </a>
      {' | '}
      <a onClick={toggleAdmin} style={{ cursor: 'pointer' }}>
        {isAdmin ? 'remove admin' : 'make admin'}
      </a>
    </span>
  )
}
