'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Profile } from '@/types/database'
import { CLASS_YEARS, INTEREST_AREAS, RESOURCE_OPTIONS } from '@/lib/constants'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    full_name: '', class_year: '', concentration: '',
    interest_area: [] as string[], build_stage: '', project_name: '', project_url: '',
    resource_preferences: [] as string[],
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        const p = data as Profile
        setProfile(p)
        let classYearStr = ''
        if (p.class_year) {
          if (p.class_year === 9999) classYearStr = 'Grad Student'
          else if (p.class_year > 2100) classYearStr = String(p.class_year / 10)
          else classYearStr = String(p.class_year)
        }
        setForm({
          full_name: p.full_name ?? '', class_year: classYearStr, concentration: p.concentration ?? '',
          interest_area: p.interest_area ?? [], build_stage: p.build_stage ?? '',
          project_name: p.project_name ?? '', project_url: p.project_url ?? '',
          resource_preferences: p.resource_preferences ?? [],
        })
      }
    }
    load()
  }, [])

  function update(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }
  function toggleInterest(a: string) {
    setForm(f => ({ ...f, interest_area: f.interest_area.includes(a) ? f.interest_area.filter(x => x !== a) : [...f.interest_area, a] }))
  }
  function toggleResource(r: string) {
    setForm(f => ({ ...f, resource_preferences: f.resource_preferences.includes(r) ? f.resource_preferences.filter(x => x !== r) : [...f.resource_preferences, r] }))
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed'); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ custom_avatar_url: publicUrl }).eq('id', user.id)
    toast.success('Avatar uploaded')
    setUploading(false)
    window.location.reload()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name || null,
      class_year: form.class_year ? (form.class_year === 'Grad Student' ? 9999 : parseFloat(form.class_year) * 10) : null,
      concentration: form.concentration || null,
      interest_area: form.interest_area,
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

  const avatarUrl = profile.custom_avatar_url ?? profile.avatar_url

  return (
    <>
      <p><b>Edit Profile</b></p>
      <p style={{ fontSize: 11, color: '#828282' }}>{profile.email}</p>
      <hr />

      <div style={{ marginBottom: 12 }}>
        {avatarUrl && (
          <img src={avatarUrl} alt="avatar" style={{ width: 64, height: 64, border: '1px solid #b0c4d8', objectFit: 'cover', marginBottom: 4, display: 'block' }} />
        )}
        <label style={{ fontSize: 12 }}>
          profile picture: <input type="file" accept="image/*" onChange={handleAvatar} disabled={uploading} style={{ fontSize: 11 }} />
        </label>
        {uploading && <span style={{ fontSize: 11, color: '#828282' }}> uploading...</span>}
      </div>

      <form onSubmit={handleSave}>
        <table style={{ border: 'none', width: '100%', maxWidth: 500 }}>
          <tbody>
            <Row label="name"><input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} style={{ width: '100%' }} /></Row>
            <Row label="class year">
              <select value={form.class_year} onChange={e => update('class_year', e.target.value)} style={{ width: '100%' }}>
                <option value="">--</option>
                {CLASS_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </Row>
            <Row label="concentration"><input type="text" value={form.concentration} onChange={e => update('concentration', e.target.value)} style={{ width: '100%' }} /></Row>
            <Row label="build stage">
              <select value={form.build_stage} onChange={e => update('build_stage', e.target.value)} style={{ width: '100%' }}>
                <option value="">--</option>
                <option value="no_idea">No idea yet</option><option value="idea">Have an idea</option>
                <option value="prototype">Building a prototype</option><option value="launched">Launched</option>
              </select>
            </Row>
            {form.build_stage && form.build_stage !== 'no_idea' && (
              <>
                <Row label="project name"><input type="text" value={form.project_name} onChange={e => update('project_name', e.target.value)} style={{ width: '100%' }} /></Row>
                <Row label="project url"><input type="url" value={form.project_url} onChange={e => update('project_url', e.target.value)} style={{ width: '100%' }} /></Row>
              </>
            )}
          </tbody>
        </table>

        <hr />
        <p style={{ fontSize: 12, marginBottom: 6 }}><b>Interests:</b></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {INTEREST_AREAS.map(a => (
            <span key={a} onClick={() => toggleInterest(a)} style={{ display: 'inline-block', padding: '2px 8px', border: '1px solid #999', background: form.interest_area.includes(a) ? '#87CEEB' : '#fff', fontWeight: form.interest_area.includes(a) ? 'bold' : 'normal', cursor: 'pointer', fontSize: 12 }}>{a}</span>
          ))}
        </div>

        <p style={{ fontSize: 12, marginBottom: 6 }}><b>Resources I want:</b></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {RESOURCE_OPTIONS.map(r => (
            <span key={r} onClick={() => toggleResource(r)} style={{ display: 'inline-block', padding: '2px 8px', border: '1px solid #999', background: form.resource_preferences.includes(r) ? '#87CEEB' : '#fff', fontWeight: form.resource_preferences.includes(r) ? 'bold' : 'normal', cursor: 'pointer', fontSize: 12 }}>{r}</span>
          ))}
        </div>

        <button type="submit" disabled={loading} style={{ background: '#87CEEB', color: '#000', border: '1px solid #5BA3C9', padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'saving...' : 'save changes'}
        </button>
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
