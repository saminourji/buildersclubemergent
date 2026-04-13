'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AgendaSlot, SlotType } from '@/types/database'

const TYPE_LABELS: Record<string, string> = {
  announcement: 'ANNOUNCE', speaker: 'SPEAKER', demo: 'DEMO',
}

export function AdminAgendaManager({ eventId, slots, maxDemos }: { eventId: string; slots: AgendaSlot[]; maxDemos: number }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [slotType, setSlotType] = useState<SlotType>('announcement')
  const [presenterName, setPresenterName] = useState('')
  const [minutes, setMinutes] = useState(5)

  const demoCount = slots.filter(s => s.slot_type === 'demo').length

  async function addSlot() {
    if (!title) { toast.error('Title required'); return }
    const supabase = createClient()
    const maxOrder = Math.max(0, ...slots.map(s => s.slot_order))
    await supabase.from('agenda_slots').insert({
      event_id: eventId, title, description: desc || null, slot_type: slotType,
      presenter_name: presenterName || null,
      slot_order: maxOrder + 1, estimated_minutes: minutes, approved: true,
    })
    setTitle(''); setDesc(''); setPresenterName(''); setMinutes(5)
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

  return (
    <>
      {slots.length > 0 ? (
        <table>
          <thead>
            <tr><th style={{ width: 70 }}>type</th><th>item</th><th>presenter</th><th style={{ width: 40 }}>time</th><th>status</th><th>actions</th></tr>
          </thead>
          <tbody>
            {slots.map(slot => (
              <tr key={slot.id} style={{ opacity: slot.approved ? 1 : 0.6 }}>
                <td style={{ fontSize: 10, fontFamily: 'monospace' }}>[{TYPE_LABELS[slot.slot_type]}]</td>
                <td>
                  {slot.title}
                  {slot.description && <span style={{ display: 'block', fontSize: 10, color: '#666' }}>{slot.description}</span>}
                </td>
                <td style={{ fontSize: 11 }}>{slot.presenter_name ?? '—'}</td>
                <td style={{ fontSize: 11, color: '#666' }}>{slot.estimated_minutes}m</td>
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
        <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>ADD ITEM {demoCount >= maxDemos && '(demo slots full)'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-end' }}>
          <select value={slotType} onChange={e => setSlotType(e.target.value as SlotType)} style={{ width: 120 }}>
            <option value="announcement">announcement</option>
            <option value="speaker">speaker</option>
            <option value="demo" disabled={demoCount >= maxDemos}>demo {demoCount >= maxDemos ? '(full)' : ''}</option>
          </select>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="title" style={{ width: 160 }} />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="description" style={{ width: 160 }} />
          <input value={presenterName} onChange={e => setPresenterName(e.target.value)} placeholder="presenter" style={{ width: 110 }} />
          <input type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} min={1} max={30} style={{ width: 50 }} title="minutes" />
          <span style={{ fontSize: 10, color: '#828282' }}>min</span>
          <button onClick={addSlot} style={{ background: '#d4e6f1', border: '1px solid #b0c4d8', padding: '2px 10px', cursor: 'pointer' }}>
            add
          </button>
        </div>
      </div>
    </>
  )
}
