'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function AdminMemberActions({ memberId, memberName, isVerified, isAdmin }: {
  memberId: string; memberName: string; isVerified: boolean; isAdmin: boolean
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

  async function deleteMember() {
    if (!confirm(`Are you sure you want to delete ${memberName}?\n\nThis will permanently remove their profile and all check-in history. This cannot be undone.`)) return
    if (!confirm(`Really delete ${memberName}? Last chance.`)) return

    const supabase = createClient()
    await supabase.from('check_ins').delete().eq('member_id', memberId)
    await supabase.from('profiles').delete().eq('id', memberId)
    toast.success('Member deleted')
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
      {' | '}
      <a onClick={deleteMember} style={{ cursor: 'pointer', color: '#a52a2a' }}>
        delete
      </a>
    </span>
  )
}
