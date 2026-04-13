'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
    full_name: '', class_year: '', concentration: '', interest_area: '',
    build_stage: '', project_name: '', project_url: '',
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
          full_name: data.full_name ?? '', class_year: data.class_year ? String(data.class_year) : '',
          concentration: data.concentration ?? '', interest_area: data.interest_area ?? '',
          build_stage: data.build_stage ?? '', project_name: data.project_name ?? '',
          project_url: data.project_url ?? '', resource_preferences: data.resource_preferences ?? [],
        })
      }
    }
    load()
  }, [])

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleResource(r: string) {
    setForm(f => ({
      ...f,
      resource_preferences: f.resource_preferences.includes(r)
        ? f.resource_preferences.filter(x => x !== r)
        : [...f.resource_preferences, r],
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
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

    if (error) toast.error('Failed to save')
    else toast.success('Saved.')
    setLoading(false)
  }

  if (!profile) return <p style={{ color: '#828282' }}>loading...</p>

  return (
    <>
      <p><b>Edit Profile</b></p>
      <p style={{ fontSize: 11, color: '#828282' }}>{profile.email}</p>
      <hr />

      <form onSubmit={handleSave}>
        <table style={{ border: 'none', width: '100%', maxWidth: 500 }}>
          <tbody>
            <Row label="name">
              <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} style={{ width: '100%' }} />
            </Row>
            <Row label="class year">
              <select value={form.class_year} onChange={e => update('class_year', e.target.value)} style={{ width: '100%' }}>
                <option value="">--</option>
                {[2025, 2026, 2027, 2028, 2029].map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </Row>
            <Row label="concentration">
              <input type="text" value={form.concentration} onChange={e => update('concentration', e.target.value)} style={{ width: '100%' }} />
            </Row>
            <Row label="interest area">
              <select value={form.interest_area} onChange={e => update('interest_area', e.target.value)} style={{ width: '100%' }}>
                <option value="">--</option>
                {INTEREST_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Row>
            <Row label="build stage">
              <select value={form.build_stage} onChange={e => update('build_stage', e.target.value)} style={{ width: '100%' }}>
                <option value="">--</option>
                <option value="no_idea">No idea yet</option>
                <option value="idea">Have an idea</option>
                <option value="prototype">Building a prototype</option>
                <option value="launched">Launched</option>
              </select>
            </Row>
            {form.build_stage && form.build_stage !== 'no_idea' && (
              <>
                <Row label="project name">
                  <input type="text" value={form.project_name} onChange={e => update('project_name', e.target.value)} style={{ width: '100%' }} />
                </Row>
                <Row label="project url">
                  <input type="url" value={form.project_url} onChange={e => update('project_url', e.target.value)} style={{ width: '100%' }} />
                </Row>
              </>
            )}
          </tbody>
        </table>

        <hr />
        <p style={{ fontSize: 12, marginBottom: 6 }}><b>Resources I want:</b></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {RESOURCE_OPTIONS.map(r => (
            <span
              key={r}
              onClick={() => toggleResource(r)}
              style={{
                display: 'inline-block', padding: '2px 8px', border: '1px solid #999',
                background: form.resource_preferences.includes(r) ? '#ff6600' : '#fff',
                color: form.resource_preferences.includes(r) ? '#000' : '#666',
                fontWeight: form.resource_preferences.includes(r) ? 'bold' : 'normal',
                cursor: 'pointer', fontSize: 12,
              }}
            >
              {r}
            </span>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ background: '#ff6600', color: '#000', border: '1px solid #cc5200', padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'saving...' : 'save changes'}
        </button>
      </form>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr style={{ background: 'transparent' }}>
      <td style={{ border: 'none', padding: '4px 0', width: 110, verticalAlign: 'top', fontSize: 12, color: '#666' }}>
        {label}:
      </td>
      <td style={{ border: 'none', padding: '4px 0' }}>{children}</td>
    </tr>
  )
}
