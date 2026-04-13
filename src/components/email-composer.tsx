'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function EmailComposer() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    body: '',
    audience: 'verified',
  })

  function update(field: string, value: string | null) {
    setForm(f => ({ ...f, [field]: value ?? '' }))
  }

  async function handleSend() {
    if (!form.subject || !form.body) {
      toast.error('Subject and body are required')
      return
    }
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
    } else {
      toast.error(data.error ?? 'Failed to send')
    }
    setLoading(false)
  }

  return (
    <div className="border border-zinc-100 rounded-lg p-5 space-y-4">
      <h2 className="text-sm font-semibold">Compose email</h2>

      <div className="space-y-1.5">
        <Label>Audience</Label>
        <Select value={form.audience} onValueChange={v => update('audience', v)}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            <SelectItem value="verified">Verified members only</SelectItem>
            <SelectItem value="unverified">Unverified only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Subject</Label>
        <Input
          value={form.subject}
          onChange={e => update('subject', e.target.value)}
          placeholder="Builders Club — this week's meeting"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Body</Label>
        <Textarea
          value={form.body}
          onChange={e => update('body', e.target.value)}
          placeholder="Write your message..."
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSend}
          disabled={loading || !form.subject || !form.body}
          className="bg-zinc-900 text-white hover:bg-zinc-700"
        >
          {loading ? 'Sending...' : 'Send email'}
        </Button>
      </div>
    </div>
  )
}
