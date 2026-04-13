'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function CheckinCodeInput({ eventId, expectedCode }: { eventId: string; expectedCode: string }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim() !== expectedCode) {
      toast.error('Wrong code. Try again.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('check_ins').insert({ member_id: user.id, event_id: eventId })
    if (error) {
      if (error.code === '23505') toast.info('Already checked in')
      else toast.error('Failed to check in')
    } else {
      toast.success('Checked in!')
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'inline' }}>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
        placeholder="00000"
        maxLength={5}
        style={{ width: 75, fontFamily: 'monospace', fontSize: 14, letterSpacing: 3, textAlign: 'center' }}
      />
      {' '}
      <button
        type="submit"
        disabled={loading || code.length < 5}
        style={{ background: '#87CEEB', color: '#000', border: '1px solid #5BA3C9', padding: '2px 10px', cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}
      >
        {loading ? '...' : 'check in'}
      </button>
    </form>
  )
}
