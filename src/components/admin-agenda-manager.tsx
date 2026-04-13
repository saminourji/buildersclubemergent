'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AgendaSlot, SlotType } from '@/types/database'

const TYPE_LABELS: Record<string, string> = {
  announcement: 'ANNOUNCE', speaker: 'SPEAKER', demo: 'DEMO',
}

type EditState = {
  title: string
  description: string
  presenter_name: string
  estimated_minutes: number
  slot_type: SlotType
}

export function AdminAgendaManager({ eventId, slots, maxDemos }: { eventId: string; slots: AgendaSlot[]; maxDemos: number }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [slotType, setSlotType] = useState<SlotType>('announcement')
  const [presenterName, setPresenterName] = useState('')
  const [minutes, setMinutes] = useState(5)

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)

  const demoCount = slots.filter(s => s.slot_type === 'demo').length

  function startEdit(slot: AgendaSlot) {
    setEditingId(slot.id)
    setEditState({
      title: slot.title,
      description: slot.description ?? '',
      presenter_name: slot.presenter_name ?? '',
      estimated_minutes: slot.estimated_minutes ?? 5,
      slot_type: slot.slot_type,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState(null)
  }

  async function saveEdit(id: string) {
    if (!editState) return
    const supabase = createClient()
    const { error } = await supabase.from('agenda_slots').update({
      title: editState.title,
      description: editState.description || null,
      presenter_name: editState.presenter_name || null,
      estimated_minutes: editState.estimated_minutes,
      slot_type: editState.slot_type,
    }).eq('id', id)
    if (error) { toast.error('Save failed'); return }
    toast.success('Saved')
    setEditingId(null)
    setEditState(null)
    router.refresh()
  }

  async function moveSlot(id: string, direction: 'up' | 'down') {
    const idx = slots.findIndex(s => s.id === id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= slots.length) return
    const supabase = createClient()
    await Promise.all([
      supabase.from('agenda_slots').update({ slot_order: slots[swapIdx].slot_order }).eq('id', id),
      supabase.from('agenda_slots').update({ slot_order: slots[idx].slot_order }).eq('id', slots[swapIdx].id),
    ])
    router.refresh()
  }

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
            <tr>
              <th style={{ width: 28 }}>#</th>
              <th style={{ width: 80 }}>type</th>
              <th>item</th>
              <th>presenter</th>
              <th style={{ width: 48 }}>min</th>
              <th>status</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, idx) => {
              const isEditing = editingId === slot.id
              return (
                <tr key={slot.id} style={{ opacity: slot.approved ? 1 : 0.6, verticalAlign: 'middle' }}>
                  {/* Order controls */}
                  <td style={{ fontSize: 10, textAlign: 'center' }}>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                      <a
                        onClick={() => moveSlot(slot.id, 'up')}
                        style={{ cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#ccc' : '#0066cc', lineHeight: 1 }}
                      >▲</a>
                      <a
                        onClick={() => moveSlot(slot.id, 'down')}
                        style={{ cursor: idx === slots.length - 1 ? 'default' : 'pointer', color: idx === slots.length - 1 ? '#ccc' : '#0066cc', lineHeight: 1 }}
                      >▼</a>
                    </span>
                  </td>

                  {/* Type */}
                  <td style={{ fontSize: 10, fontFamily: 'monospace' }}>
                    {isEditing && editState ? (
                      <select
                        value={editState.slot_type}
                        onChange={e => setEditState({ ...editState, slot_type: e.target.value as SlotType })}
                        style={{ fontSize: 10, width: 80 }}
                      >
                        <option value="announcement">announce</option>
                        <option value="speaker">speaker</option>
                        <option value="demo">demo</option>
                      </select>
                    ) : (
                      `[${TYPE_LABELS[slot.slot_type]}]`
                    )}
                  </td>

                  {/* Title + description */}
                  <td>
                    {isEditing && editState ? (
                      <>
                        <input
                          value={editState.title}
                          onChange={e => setEditState({ ...editState, title: e.target.value })}
                          style={{ width: '100%', maxWidth: 180, marginBottom: 2, display: 'block', fontSize: 11 }}
                        />
                        <input
                          value={editState.description}
                          onChange={e => setEditState({ ...editState, description: e.target.value })}
                          placeholder="description"
                          style={{ width: '100%', maxWidth: 180, fontSize: 10 }}
                        />
                      </>
                    ) : (
                      <>
                        {slot.title}
                        {slot.description && (
                          <span style={{ display: 'block', fontSize: 10, color: '#666' }}>{slot.description}</span>
                        )}
                      </>
                    )}
                  </td>

                  {/* Presenter */}
                  <td style={{ fontSize: 11 }}>
                    {isEditing && editState ? (
                      <input
                        value={editState.presenter_name}
                        onChange={e => setEditState({ ...editState, presenter_name: e.target.value })}
                        placeholder="presenter"
                        style={{ width: 100, fontSize: 11 }}
                      />
                    ) : (
                      slot.presenter_name ?? '—'
                    )}
                  </td>

                  {/* Minutes */}
                  <td style={{ fontSize: 11, color: '#666' }}>
                    {isEditing && editState ? (
                      <input
                        type="number"
                        value={editState.estimated_minutes}
                        onChange={e => setEditState({ ...editState, estimated_minutes: Number(e.target.value) })}
                        min={1} max={60}
                        style={{ width: 44, fontSize: 11 }}
                      />
                    ) : (
                      `${slot.estimated_minutes}m`
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ fontSize: 11 }}>
                    {slot.approved
                      ? <span style={{ color: 'green' }}>[ok]</span>
                      : <span style={{ color: '#a52a2a' }}>[pending]</span>}
                  </td>

                  {/* Actions */}
                  <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                    {isEditing ? (
                      <>
                        <a onClick={() => saveEdit(slot.id)} style={{ cursor: 'pointer', color: 'green' }}>save</a>
                        {' | '}
                        <a onClick={cancelEdit} style={{ cursor: 'pointer', color: '#828282' }}>cancel</a>
                      </>
                    ) : (
                      <>
                        {!slot.approved && (
                          <>
                            <a onClick={() => approveSlot(slot.id)} style={{ cursor: 'pointer', color: 'green' }}>approve</a>
                            {' | '}
                            <a onClick={() => rejectSlot(slot.id)} style={{ cursor: 'pointer', color: '#a52a2a' }}>reject</a>
                            {' | '}
                          </>
                        )}
                        <a onClick={() => startEdit(slot)} style={{ cursor: 'pointer', color: '#0066cc' }}>edit</a>
                        {' | '}
                        <a onClick={() => removeSlot(slot.id)} style={{ cursor: 'pointer', color: '#a52a2a' }}>remove</a>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
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
          <input type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} min={1} max={60} style={{ width: 50 }} title="minutes" />
          <span style={{ fontSize: 10, color: '#828282' }}>min</span>
          <button onClick={addSlot} style={{ background: '#d4e6f1', border: '1px solid #b0c4d8', padding: '2px 10px', cursor: 'pointer' }}>
            add
          </button>
        </div>
      </div>
    </>
  )
}
