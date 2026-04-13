'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function AdminMemberActions({ memberId, memberName, isVerified, isAdmin, isArchived }: {
  memberId: string; memberName: string; isVerified: boolean; isAdmin: boolean; isArchived: boolean
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

  async function archiveMember() {
    if (!confirm(`Archive ${memberName}?\n\nThey will be hidden from the directory and can't log in, but their data is preserved.`)) return
    const supabase = createClient()
    await supabase.from('profiles').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', memberId)
    toast.success('Archived')
    router.refresh()
  }

  async function unarchiveMember() {
    const supabase = createClient()
    await supabase.from('profiles').update({ archived: false, archived_at: null }).eq('id', memberId)
    toast.success('Restored')
    router.refresh()
  }

  if (isArchived) {
    return (
      <span style={{ fontSize: 11 }}>
        <a onClick={unarchiveMember} style={{ cursor: 'pointer', color: 'green' }}>restore</a>
      </span>
    )
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
      <a onClick={archiveMember} style={{ cursor: 'pointer', color: '#a52a2a' }}>
        archive
      </a>
    </span>
  )
}
