'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Profile } from '@/types/database'

const INTEREST_AREAS = [
  'Software / Apps', 'Hardware / Devices', 'Biotech / Life Sciences',
  'Climate / Energy', 'AI / ML', 'Consumer', 'Enterprise / B2B',
  'Social Impact', 'Creative / Media', 'Other',
]

const RESOURCE_OPTIONS = [
  'Funding & grants', 'Co-founder matching', 'Mentorship',
  'Office hours w/ founders', 'Guest speaker sessions',
  'Technical workshops', 'Demo opportunities', 'Community & networking',
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    class_year: '',
    concentration: '',
    interest_area: '',
    build_stage: '',
    project_name: '',
    project_url: '',
    resource_preferences: [] as string[],
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)
        setForm({
          full_name: data.full_name ?? '',
          class_year: data.class_year ? String(data.class_year) : '',
          concentration: data.concentration ?? '',
          interest_area: data.interest_area ?? '',
          build_stage: data.build_stage ?? '',
          project_name: data.project_name ?? '',
          project_url: data.project_url ?? '',
          resource_preferences: data.resource_preferences ?? [],
        })
      }
    }
    load()
  }, [])

  function update(field: string, value: string | null) {
    setForm(f => ({ ...f, [field]: value ?? '' }))
  }

  function toggleResource(r: string) {
    setForm(f => ({
      ...f,
      resource_preferences: f.resource_preferences.includes(r)
        ? f.resource_preferences.filter(x => x !== r)
        : [...f.resource_preferences, r],
    }))
  }

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name || null,
      class_year: form.class_year ? parseInt(form.class_year) : null,
      concentration: form.concentration || null,
      interest_area: form.interest_area || null,
      build_stage: form.build_stage || null,
      project_name: form.project_name || null,
      project_url: form.project_url || null,
      resource_preferences: form.resource_preferences,
    }).eq('id', user.id)

    if (error) {
      toast.error('Failed to save. Try again.')
    } else {
      toast.success('Profile updated')
    }
    setLoading(false)
  }

  if (!profile) return <div className="text-sm text-zinc-400">Loading...</div>

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-zinc-400 mt-1">{profile.email}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Class year</Label>
          <Select value={form.class_year ?? ''} onValueChange={v => update('class_year', v)}>
            <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
            <SelectContent>
              {[2025, 2026, 2027, 2028, 2029].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Concentration</Label>
          <Input value={form.concentration} onChange={e => update('concentration', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Interest area</Label>
          <Select value={form.interest_area} onValueChange={v => update('interest_area', v)}>
            <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
            <SelectContent>
              {INTEREST_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Build stage</Label>
          <Select value={form.build_stage} onValueChange={v => update('build_stage', v)}>
            <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no_idea">No idea yet</SelectItem>
              <SelectItem value="idea">Have an idea</SelectItem>
              <SelectItem value="prototype">Building a prototype</SelectItem>
              <SelectItem value="launched">Launched</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {form.build_stage && form.build_stage !== 'no_idea' && (
          <>
            <div className="space-y-1.5">
              <Label>Project name</Label>
              <Input value={form.project_name} onChange={e => update('project_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Project URL</Label>
              <Input value={form.project_url} onChange={e => update('project_url', e.target.value)} type="url" />
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label>Resources I want</Label>
        <div className="grid grid-cols-2 gap-2">
          {RESOURCE_OPTIONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => toggleResource(r)}
              className={`text-left text-sm px-3 py-2 rounded-md border transition-colors ${
                form.resource_preferences.includes(r)
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="bg-zinc-900 text-white hover:bg-zinc-700"
      >
        {loading ? 'Saving...' : 'Save changes'}
      </Button>
    </div>
  )
}
