'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CLASS_YEARS, INTEREST_AREAS, SKILLS, RESOURCE_OPTIONS } from '@/lib/constants'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    class_year: '',
    concentration: '',
    interest_area: [] as string[],
    interestOther: '',
    skills: [] as string[],
    skillsOther: '',
    build_stage: '',
    project_name: '',
    project_url: '',
    phone: '',
    resource_preferences: [] as string[],
    resourceOther: '',
  })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleChip(field: 'interest_area' | 'skills' | 'resource_preferences', value: string) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((x: string) => x !== value)
        : [...f[field], value],
    }))
  }

  // Resolve array with custom "Other" text substituted in
  function resolveWithOther(arr: string[], otherText: string): string[] {
    const trimmed = otherText.trim()
    if (!arr.includes('Other')) return arr
    return [...arr.filter(x => x !== 'Other'), ...(trimmed ? [trimmed] : [])]
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name) { toast.error('Name is required'); return }
    if (!form.build_stage) { toast.error('Select your build stage'); return }
    if (!accepted) { toast.error('You must agree to the Terms and acknowledge the Privacy Policy'); return }

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
      interest_area: resolveWithOther(form.interest_area, form.interestOther),
      skills: resolveWithOther(form.skills, form.skillsOther),
      build_stage: form.build_stage || null,
      project_name: form.project_name || null,
      project_url: form.project_url || null,
      phone: form.phone || null,
      resource_preferences: resolveWithOther(form.resource_preferences, form.resourceOther),
      onboarding_complete: true,
      terms_accepted_at: new Date().toISOString(),
      privacy_acknowledged_at: new Date().toISOString(),
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
                    <Row label="Phone">
                      <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} style={{ width: '100%' }} placeholder="optional" />
                    </Row>
                  </tbody>
                </table>

                <hr />
                <ChipGroup
                  label="Interests"
                  options={INTEREST_AREAS}
                  selected={form.interest_area}
                  onToggle={v => toggleChip('interest_area', v)}
                  otherValue={form.interestOther}
                  onOtherChange={v => update('interestOther', v)}
                />

                <ChipGroup
                  label="Skills"
                  options={SKILLS}
                  selected={form.skills}
                  onToggle={v => toggleChip('skills', v)}
                  otherValue={form.skillsOther}
                  onOtherChange={v => update('skillsOther', v)}
                />

                <ChipGroup
                  label="Resources I want"
                  options={RESOURCE_OPTIONS}
                  selected={form.resource_preferences}
                  onToggle={v => toggleChip('resource_preferences', v)}
                  otherValue={form.resourceOther}
                  onOtherChange={v => update('resourceOther', v)}
                />

                <hr />
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={e => setAccepted(e.target.checked)}
                      style={{ marginRight: 6 }}
                      required
                    />
                    I agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
                    {' '}and acknowledge the{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                  </label>
                </div>
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

function ChipGroup({
  label, options, selected, onToggle, otherValue, onOtherChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
  otherValue: string
  onOtherChange: (v: string) => void
}) {
  const otherSelected = selected.includes('Other')
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ marginBottom: 8, fontSize: 12 }}><b>{label}</b> <span style={{ color: '#828282', fontWeight: 'normal' }}>(click to select multiple)</span></p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
        {options.map(a => (
          <span
            key={a}
            onClick={() => onToggle(a)}
            style={{
              display: 'inline-block', padding: '2px 8px', border: '1px solid #999',
              background: selected.includes(a) ? '#87CEEB' : '#fff',
              fontWeight: selected.includes(a) ? 'bold' : 'normal',
              cursor: 'pointer', fontSize: 12,
            }}
          >
            {a}
          </span>
        ))}
        {otherSelected && (
          <input
            autoFocus
            type="text"
            value={otherValue}
            onChange={e => onOtherChange(e.target.value)}
            placeholder="specify..."
            style={{ fontSize: 12, padding: '1px 6px', border: '1px solid #5BA3C9', width: 140 }}
          />
        )}
      </div>
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
