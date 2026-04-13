'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CLASS_YEARS, INTEREST_AREAS, RESOURCE_OPTIONS } from '@/lib/constants'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    class_year: '',
    concentration: '',
    interest_area: [] as string[],
    build_stage: '',
    project_name: '',
    project_url: '',
    resource_preferences: [] as string[],
  })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleInterest(a: string) {
    setForm(f => ({
      ...f,
      interest_area: f.interest_area.includes(a)
        ? f.interest_area.filter(x => x !== a)
        : [...f.interest_area, a],
    }))
  }

  function toggleResource(r: string) {
    setForm(f => ({
      ...f,
      resource_preferences: f.resource_preferences.includes(r)
        ? f.resource_preferences.filter(x => x !== r)
        : [...f.resource_preferences, r],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name) { toast.error('Name is required'); return }
    if (!form.build_stage) { toast.error('Select your build stage'); return }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email ?? '',
      full_name: form.full_name || null,
      class_year: form.class_year ? (form.class_year === 'Grad Student' ? 9999 : parseFloat(form.class_year) * 10) : null,
      concentration: form.concentration || null,
      interest_area: form.interest_area,
      build_stage: form.build_stage || null,
      project_name: form.project_name || null,
      project_url: form.project_url || null,
      resource_preferences: form.resource_preferences,
      onboarding_complete: true,
    }, { onConflict: 'id' })

    if (error) {
      toast.error(`Error: ${error.message}`)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 16px' }}>
      <table style={{ border: '1px solid #b0c4d8', width: '100%', background: '#fff' }}>
        <tbody>
          <tr>
            <td style={{ background: '#87CEEB', padding: '4px 8px', border: 'none' }}>
              <b style={{ color: '#000' }}>New Member Registration</b>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '16px', border: 'none' }}>
              <form onSubmit={handleSubmit}>
                <p style={{ marginBottom: 12, fontSize: 12, color: '#828282' }}>
                  Tell us about yourself. All fields optional except name and build stage.
                </p>

                <table style={{ border: 'none', width: '100%' }}>
                  <tbody>
                    <Row label="Name *">
                      <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} style={{ width: '100%' }} />
                    </Row>
                    <Row label="Class year">
                      <select value={form.class_year} onChange={e => update('class_year', e.target.value)} style={{ width: '100%' }}>
                        <option value="">--</option>
                        {CLASS_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </Row>
                    <Row label="Concentration">
                      <input type="text" value={form.concentration} onChange={e => update('concentration', e.target.value)} style={{ width: '100%' }} />
                    </Row>
                    <Row label="Build stage *">
                      <select value={form.build_stage} onChange={e => update('build_stage', e.target.value)} style={{ width: '100%' }}>
                        <option value="">--</option>
                        <option value="no_idea">No idea yet — exploring</option>
                        <option value="idea">Have an idea</option>
                        <option value="prototype">Building a prototype</option>
                        <option value="launched">Launched something</option>
                      </select>
                    </Row>
                    {form.build_stage && form.build_stage !== 'no_idea' && (
                      <>
                        <Row label="Project name">
                          <input type="text" value={form.project_name} onChange={e => update('project_name', e.target.value)} style={{ width: '100%' }} />
                        </Row>
                        <Row label="Project URL">
                          <input type="url" value={form.project_url} onChange={e => update('project_url', e.target.value)} style={{ width: '100%' }} placeholder="https://" />
                        </Row>
                      </>
                    )}
                  </tbody>
                </table>

                <hr />
                <p style={{ marginBottom: 8, fontSize: 12 }}><b>Interests</b> (click to select multiple)</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {INTEREST_AREAS.map(a => (
                    <span
                      key={a}
                      onClick={() => toggleInterest(a)}
                      style={{
                        display: 'inline-block', padding: '2px 8px', border: '1px solid #999',
                        background: form.interest_area.includes(a) ? '#87CEEB' : '#fff',
                        fontWeight: form.interest_area.includes(a) ? 'bold' : 'normal',
                        cursor: 'pointer', fontSize: 12,
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>

                <p style={{ marginBottom: 8, fontSize: 12 }}><b>What resources do you want?</b> (click to select)</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {RESOURCE_OPTIONS.map(r => (
                    <span
                      key={r}
                      onClick={() => toggleResource(r)}
                      style={{
                        display: 'inline-block', padding: '2px 8px', border: '1px solid #999',
                        background: form.resource_preferences.includes(r) ? '#87CEEB' : '#fff',
                        fontWeight: form.resource_preferences.includes(r) ? 'bold' : 'normal',
                        cursor: 'pointer', fontSize: 12,
                      }}
                    >
                      {r}
                    </span>
                  ))}
                </div>

                <hr />
                <button
                  type="submit" disabled={loading}
                  style={{ background: '#87CEEB', color: '#000', border: '1px solid #5BA3C9', padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}
                >
                  {loading ? 'saving...' : 'submit'}
                </button>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr style={{ background: 'transparent' }}>
      <td style={{ border: 'none', padding: '4px 0', width: 120, verticalAlign: 'top', fontSize: 12, color: '#666' }}>{label}:</td>
      <td style={{ border: 'none', padding: '4px 0' }}>{children}</td>
    </tr>
  )
}
