'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Member = { id: string; full_name: string | null; email: string }

export function AdminAttendanceManager({
  eventId,
  allMembers,
  attendeeIds,
}: {
  eventId: string
  allMembers: Member[]
  attendeeIds: string[]
}) {
  const router = useRouter()
  const [present, setPresent] = useState<Set<string>>(new Set(attendeeIds))
  const [saving, setSaving] = useState(false)

  function toggle(id: string) {
    setPresent(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()

    const toAdd = allMembers.filter(m => present.has(m.id) && !attendeeIds.includes(m.id))
    const toRemove = attendeeIds.filter(id => !present.has(id))

    const inserts = toAdd.map(m => ({ event_id: eventId, member_id: m.id }))

    const [insertResult, ...removeResults] = await Promise.all([
      inserts.length > 0
        ? supabase.from('check_ins').upsert(inserts, { onConflict: 'event_id,member_id', ignoreDuplicates: true })
        : Promise.resolve({ error: null }),
      ...toRemove.map(id =>
        supabase.from('check_ins').delete().eq('event_id', eventId).eq('member_id', id)
      ),
    ])

    const anyError = [insertResult, ...removeResults].some(r => r.error)
    if (anyError) {
      toast.error('Some changes failed to save')
    } else {
      toast.success(`Attendance saved (${present.size} present)`)
    }

    setSaving(false)
    router.refresh()
  }

  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#828282' }}>{present.size} marked present</span>
        <button
          onClick={save}
          disabled={saving}
          style={{ background: '#d4e6f1', border: '1px solid #b0c4d8', padding: '2px 10px', cursor: 'pointer', fontSize: 12 }}
        >
          {saving ? 'saving...' : 'save attendance'}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th style={{ width: 28 }}>✓</th>
            <th>name</th>
            <th>email</th>
          </tr>
        </thead>
        <tbody>
          {allMembers.map(m => (
            <tr
              key={m.id}
              onClick={() => toggle(m.id)}
              style={{ cursor: 'pointer', background: present.has(m.id) ? '#eaf4fb' : undefined }}
            >
              <td style={{ textAlign: 'center', fontSize: 13 }}>
                {present.has(m.id) ? '✓' : ''}
              </td>
              <td style={{ fontWeight: present.has(m.id) ? 'bold' : 'normal' }}>
                {m.full_name ?? '—'}
              </td>
              <td style={{ fontSize: 11, color: '#666' }}>{m.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
