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
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ slot_type: 'announcement' as SlotType, title: '', presenter_name: '' })

  async function addSlot() {
    if (!form.title) { toast.error('Title required'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('agenda_slots').insert({
      event_id: eventId, slot_type: form.slot_type, title: form.title,
      presenter_name: form.presenter_name || null, slot_order: slots.length, approved: true,
    })
    if (error) toast.error('Failed')
    else { toast.success('Added'); setForm({ slot_type: 'announcement', title: '', presenter_name: '' }); setAdding(false); router.refresh() }
    setLoading(false)
  }

  async function approveSlot(id: string) {
    const supabase = createClient()
    await supabase.from('agenda_slots').update({ approved: true }).eq('id', id)
    router.refresh()
  }

  async function removeSlot(id: string) {
    const supabase = createClient()
    await supabase.from('agenda_slots').delete().eq('id', id)
    toast.success('Removed')
    router.refresh()
  }

  const pending = slots.filter(s => !s.approved)
  const approved = slots.filter(s => s.approved)

  return (
    <div>
      {pending.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#ff6600', marginBottom: 4 }}>PENDING APPROVAL ({pending.length})</p>
          {pending.map(slot => (
            <p key={slot.id} style={{ marginBottom: 4 }}>
              [{TYPE_LABELS[slot.slot_type]}] {slot.title}
              {slot.presenter_name && ` — ${slot.presenter_name}`}
              {' '}
              <a onClick={() => approveSlot(slot.id)} style={{ cursor: 'pointer', fontSize: 11, color: 'green' }}>[approve]</a>
              {' '}
              <a onClick={() => removeSlot(slot.id)} style={{ cursor: 'pointer', fontSize: 11, color: 'red' }}>[remove]</a>
            </p>
          ))}
          <hr />
        </>
      )}

      {approved.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>type</th>
              <th>item</th>
              <th>presenter</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {approved.map(slot => (
              <tr key={slot.id}>
                <td style={{ fontSize: 10, fontFamily: 'monospace' }}>[{TYPE_LABELS[slot.slot_type]}]</td>
                <td>{slot.title}</td>
                <td style={{ fontSize: 11 }}>{slot.presenter_name ?? '—'}</td>
                <td>
                  <a onClick={() => removeSlot(slot.id)} style={{ cursor: 'pointer', fontSize: 11, color: 'red' }}>[x]</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#828282', fontSize: 12, marginBottom: 8 }}>No agenda items yet.</p>
      )}

      {adding ? (
        <div style={{ marginTop: 8, padding: 8, border: '1px solid #ccc', background: '#fff' }}>
          <select value={form.slot_type} onChange={e => setForm(f => ({ ...f, slot_type: e.target.value as SlotType }))} style={{ marginRight: 4 }}>
            <option value="announcement">announcement</option>
            <option value="speaker">speaker</option>
            <option value="demo">demo</option>
          </select>
          <input placeholder="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ width: 180, marginRight: 4 }} />
          <input placeholder="presenter (opt)" value={form.presenter_name} onChange={e => setForm(f => ({ ...f, presenter_name: e.target.value }))} style={{ width: 140, marginRight: 4 }} />
          <button onClick={addSlot} disabled={loading} style={{ background: '#e8e8df', border: '1px solid #999', padding: '2px 10px', cursor: 'pointer' }}>
            {loading ? '...' : 'add'}
          </button>
          {' '}
          <a onClick={() => setAdding(false)} style={{ cursor: 'pointer', fontSize: 11 }}>cancel</a>
        </div>
      ) : (
        <p style={{ marginTop: 8 }}>
          <a onClick={() => setAdding(true)} style={{ cursor: 'pointer', fontSize: 12 }}>[+ add agenda item]</a>
        </p>
      )}
    </div>
  )
}
