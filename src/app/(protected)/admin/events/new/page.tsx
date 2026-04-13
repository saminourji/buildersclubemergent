'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    checkin_open: false,
  })

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleCreate() {
    if (!form.title || !form.event_date) {
      toast.error('Title and date are required')
      return
    }
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

    if (error) {
      toast.error('Failed to create event')
      setLoading(false)
      return
    }

    toast.success('Event created')
    router.push(`/admin/events/${data.id}`)
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">New event</h1>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={e => update('title', e.target.value)}
            placeholder="Builders Club #12"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Date & time</Label>
          <Input
            type="datetime-local"
            value={form.event_date}
            onChange={e => update('event_date', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Description <span className="text-zinc-400">(optional)</span></Label>
          <Textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="What's happening this week?"
            rows={3}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.checkin_open}
            onChange={e => update('checkin_open', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Open check-in immediately</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button
          onClick={handleCreate}
          disabled={loading}
          className="bg-zinc-900 text-white hover:bg-zinc-700"
        >
          {loading ? 'Creating...' : 'Create event'}
        </Button>
      </div>
    </div>
  )
}
