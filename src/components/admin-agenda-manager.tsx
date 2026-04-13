'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AgendaSlot, SlotType } from '@/types/database'
import { AgendaSlotView } from './agenda-slot-view'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AdminAgendaManager({
  eventId,
  slots,
}: {
  eventId: string
  slots: AgendaSlot[]
}) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    slot_type: 'announcement' as SlotType,
    title: '',
    presenter_name: '',
    description: '',
  })

  async function addSlot() {
    if (!form.title) { toast.error('Title is required'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('agenda_slots').insert({
      event_id: eventId,
      slot_type: form.slot_type,
      title: form.title,
      presenter_name: form.presenter_name || null,
      description: form.description || null,
      slot_order: slots.length,
      approved: true,
    })
    if (error) {
      toast.error('Failed to add slot')
    } else {
      toast.success('Slot added')
      setForm({ slot_type: 'announcement', title: '', presenter_name: '', description: '' })
      setAdding(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function approveSlot(slotId: string) {
    const supabase = createClient()
    await supabase.from('agenda_slots').update({ approved: true }).eq('id', slotId)
    router.refresh()
  }

  async function removeSlot(slotId: string) {
    const supabase = createClient()
    await supabase.from('agenda_slots').delete().eq('id', slotId)
    toast.success('Slot removed')
    router.refresh()
  }

  const pendingSlots = slots.filter(s => !s.approved)

  return (
    <div className="space-y-4">
      {pendingSlots.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-amber-600 font-medium">Pending approval ({pendingSlots.length})</p>
          {pendingSlots.map(slot => (
            <div key={slot.id} className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
              <div className="flex-1 text-sm">
                <span className="font-medium">{slot.title}</span>
                {slot.presenter_name && <span className="text-zinc-400"> — {slot.presenter_name}</span>}
              </div>
              <button onClick={() => approveSlot(slot.id)} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                Approve
              </button>
              <button onClick={() => removeSlot(slot.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {slots.filter(s => s.approved).map(slot => (
        <div key={slot.id} className="flex items-start gap-2">
          <div className="flex-1">
            <AgendaSlotView slot={slot} />
          </div>
          <button
            onClick={() => removeSlot(slot.id)}
            className="text-xs text-zinc-400 hover:text-red-500 mt-3 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}

      {adding ? (
        <div className="border border-zinc-100 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Select value={form.slot_type} onValueChange={v => setForm(f => ({ ...f, slot_type: v as SlotType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="speaker">Guest Speaker</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Presenter name (optional)"
              value={form.presenter_name}
              onChange={e => setForm(f => ({ ...f, presenter_name: e.target.value }))}
            />
          </div>
          <Input
            placeholder="Title / description"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" onClick={addSlot} disabled={loading} className="bg-zinc-900 text-white hover:bg-zinc-700">
              {loading ? 'Adding...' : 'Add slot'}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdding(true)}
          className="w-full border-dashed"
        >
          + Add agenda slot
        </Button>
      )}
    </div>
  )
}
