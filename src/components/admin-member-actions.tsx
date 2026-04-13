'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function AdminMemberActions({
  memberId, isVerified, isAdmin,
}: {
  memberId: string; isVerified: boolean; isAdmin: boolean
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
    if (res.ok) { toast.success(data.message); router.refresh() }
    else toast.error(data.error ?? 'Failed')
    setLoading(false)
  }

  return (
    <span style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
      {loading ? '...' : (
        <>
          <a onClick={() => action(isVerified ? 'unverify' : 'verify')} style={{ cursor: 'pointer' }}>
            {isVerified ? 'unverify' : 'verify'}
          </a>
          {' | '}
          <a onClick={() => action('manual-checkin')} style={{ cursor: 'pointer' }}>
            +checkin
          </a>
          {!isAdmin && (
            <>
              {' | '}
              <a onClick={() => action('make-admin')} style={{ cursor: 'pointer' }}>
                make admin
              </a>
            </>
          )}
        </>
      )}
    </span>
  )
}
