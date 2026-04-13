'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function EmailComposer() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ subject: '', body: '', audience: 'verified' })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject || !form.body) { toast.error('Subject and body required'); return }
    if (!confirm(`Send to ${form.audience} members?`)) return

    setLoading(true)
    const res = await fetch('/api/admin/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(`Sent to ${data.count} recipients`)
      setForm({ subject: '', body: '', audience: 'verified' })
      router.refresh()
    } else toast.error(data.error ?? 'Failed')
    setLoading(false)
  }

  return (
    <div style={{ border: '1px solid #b0c4d8', padding: 12, background: '#fff' }}>
      <p style={{ marginBottom: 8, fontSize: 12 }}><b>Compose email</b></p>
      <form onSubmit={handleSend}>
        <table style={{ border: 'none', width: '100%' }}>
          <tbody>
            <tr style={{ background: 'transparent' }}>
              <td style={{ border: 'none', padding: '4px 0', width: 80, fontSize: 12, color: '#666', verticalAlign: 'top' }}>audience:</td>
              <td style={{ border: 'none', padding: '4px 0' }}>
                <select value={form.audience} onChange={e => update('audience', e.target.value)}>
                  <option value="all">all members</option>
                  <option value="verified">verified only</option>
                  <option value="unverified">unverified only</option>
                </select>
              </td>
            </tr>
            <tr style={{ background: 'transparent' }}>
              <td style={{ border: 'none', padding: '4px 0', fontSize: 12, color: '#666', verticalAlign: 'top' }}>subject:</td>
              <td style={{ border: 'none', padding: '4px 0' }}>
                <input type="text" value={form.subject} onChange={e => update('subject', e.target.value)} style={{ width: '100%' }} placeholder="Builders Club — this week" />
              </td>
            </tr>
            <tr style={{ background: 'transparent' }}>
              <td style={{ border: 'none', padding: '4px 0', fontSize: 12, color: '#666', verticalAlign: 'top' }}>body:</td>
              <td style={{ border: 'none', padding: '4px 0' }}>
                <textarea value={form.body} onChange={e => update('body', e.target.value)} rows={5} style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }} placeholder="Write your message..." />
              </td>
            </tr>
          </tbody>
        </table>
        <button type="submit" disabled={loading || !form.subject || !form.body} style={{ background: '#87CEEB', color: '#000', border: '1px solid #5BA3C9', padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>
          {loading ? 'sending...' : 'send email'}
        </button>
      </form>
    </div>
  )
}
