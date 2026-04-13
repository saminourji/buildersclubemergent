'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AgendaSlot, SlotType } from '@/types/database'

const TYPE_LABELS: Record<string, string> = {
  announcement: 'ANNOUNCE', speaker: 'SPEAKER', demo: 'DEMO',
}

export function AdminAgendaManager({ eventId, slots }: { eventId: string; slots: AgendaSlot[] }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slotType, setSlotType] = useState<SlotType>('announcement')
  const [presenterName, setPresenterName] = useState('')

  async function addSlot() {
    if (!title) { toast.error('Title required'); return }
    const supabase = createClient()
    const maxOrder = Math.max(0, ...slots.map(s => s.slot_order))
    await supabase.from('agenda_slots').insert({
      event_id: eventId, title, slot_type: slotType,
      presenter_name: presenterName || null,
      slot_order: maxOrder + 1, approved: true,
    })
    setTitle(''); setPresenterName('')
    toast.success('Added')
    router.refresh()
  }

  async function removeSlot(id: string) {
    const supabase = createClient()
    await supabase.from('agenda_slots').delete().eq('id', id)
    toast.success('Removed')
    router.refresh()
  }

  async function approveSlot(id: string) {
    const supabase = createClient()
    await supabase.from('agenda_slots').update({ approved: true }).eq('id', id)
    toast.success('Approved')
    router.refresh()
  }

  async function rejectSlot(id: string) {
    const supabase = createClient()
    await supabase.from('agenda_slots').delete().eq('id', id)
    toast.success('Rejected')
    router.refresh()
  }

  const demoCount = slots.filter(s => s.slot_type === 'demo').length

  return (
    <>
      {slots.length > 0 ? (
        <table>
          <thead>
            <tr><th style={{ width: 80 }}>type</th><th>item</th><th>presenter</th><th>status</th><th>actions</th></tr>
          </thead>
          <tbody>
            {slots.map(slot => (
              <tr key={slot.id} style={{ opacity: slot.approved ? 1 : 0.6 }}>
                <td style={{ fontSize: 10, fontFamily: 'monospace' }}>[{TYPE_LABELS[slot.slot_type]}]</td>
                <td>{slot.title}</td>
                <td style={{ fontSize: 11 }}>{slot.presenter_name ?? '—'}</td>
                <td style={{ fontSize: 11 }}>
                  {slot.approved
                    ? <span style={{ color: 'green' }}>[ok]</span>
                    : <span style={{ color: '#a52a2a' }}>[pending]</span>}
                </td>
                <td style={{ fontSize: 11 }}>
                  {!slot.approved && (
                    <>
                      <a onClick={() => approveSlot(slot.id)} style={{ cursor: 'pointer', color: 'green' }}>approve</a>
                      {' | '}
                      <a onClick={() => rejectSlot(slot.id)} style={{ cursor: 'pointer', color: '#a52a2a' }}>reject</a>
                      {' | '}
                    </>
                  )}
                  <a onClick={() => removeSlot(slot.id)} style={{ cursor: 'pointer', color: '#a52a2a' }}>remove</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#828282', fontSize: 12, marginBottom: 8 }}>No agenda items.</p>
      )}

      <div style={{ marginTop: 12, border: '1px solid #b0c4d8', padding: 8, background: '#fff' }}>
        <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>ADD ITEM {demoCount >= 3 && '(demo slots full)'}</p>
        <select value={slotType} onChange={e => setSlotType(e.target.value as SlotType)} style={{ marginRight: 4, width: 120 }}>
          <option value="announcement">announcement</option>
          <option value="speaker">speaker</option>
          <option value="demo" disabled={demoCount >= 3}>demo {demoCount >= 3 ? '(full)' : ''}</option>
        </select>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="title" style={{ marginRight: 4, width: 160 }} />
        <input value={presenterName} onChange={e => setPresenterName(e.target.value)} placeholder="presenter" style={{ marginRight: 4, width: 120 }} />
        <button onClick={addSlot} style={{ background: '#d4e6f1', border: '1px solid #b0c4d8', padding: '2px 10px', cursor: 'pointer' }}>
          add
        </button>
      </div>
    </>
  )
}
