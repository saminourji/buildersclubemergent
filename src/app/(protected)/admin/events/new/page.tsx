'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', event_date: '', checkin_open: false })

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.event_date) { toast.error('Title and date required'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase.from('events').insert({
      title: form.title,
      description: form.description || null,
      event_date: new Date(form.event_date).toISOString(),
      checkin_open: form.checkin_open,
      created_by: user.id,
    }).select().single()

    if (error) { toast.error('Failed to create'); setLoading(false); return }
    toast.success('Created')
    router.push(`/admin/events/${data.id}`)
  }

  return (
    <>
      <p><b>New Event</b></p>
      <hr />

      <form onSubmit={handleCreate}>
        <table style={{ border: 'none', width: '100%', maxWidth: 500 }}>
          <tbody>
            <Row label="title *">
              <input type="text" value={form.title} onChange={e => update('title', e.target.value)} style={{ width: '100%' }} placeholder="Builders Club #12" />
            </Row>
            <Row label="date *">
              <input type="datetime-local" value={form.event_date} onChange={e => update('event_date', e.target.value)} style={{ width: '100%' }} />
            </Row>
            <Row label="description">
              <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} style={{ width: '100%' }} />
            </Row>
            <Row label="check-in">
              <label>
                <input type="checkbox" checked={form.checkin_open} onChange={e => update('checkin_open', e.target.checked)} />
                {' '}open immediately
              </label>
            </Row>
          </tbody>
        </table>

        <hr />
        <button type="submit" disabled={loading} style={{ background: '#ff6600', color: '#000', border: '1px solid #cc5200', padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'creating...' : 'create event'}
        </button>
        {' '}
        <a onClick={() => router.back()} style={{ cursor: 'pointer', fontSize: 12 }}>cancel</a>
      </form>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr style={{ background: 'transparent' }}>
      <td style={{ border: 'none', padding: '4px 0', width: 110, verticalAlign: 'top', fontSize: 12, color: '#666' }}>{label}:</td>
      <td style={{ border: 'none', padding: '4px 0' }}>{children}</td>
    </tr>
  )
}
