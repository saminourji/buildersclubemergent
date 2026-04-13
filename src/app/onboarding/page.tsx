'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const INTEREST_AREAS = [
  'Software / Apps',
  'Hardware / Devices',
  'Biotech / Life Sciences',
  'Climate / Energy',
  'AI / ML',
  'Consumer',
  'Enterprise / B2B',
  'Social Impact',
  'Creative / Media',
  'Other',
]

const RESOURCE_OPTIONS = [
  'Funding & grants',
  'Co-founder matching',
  'Mentorship',
  'Office hours w/ founders',
  'Guest speaker sessions',
  'Technical workshops',
  'Demo opportunities',
  'Community & networking',
]

const STEPS = ['About you', 'Your build', 'Resources']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
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

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name || null,
      class_year: form.class_year ? parseInt(form.class_year) : null,
      concentration: form.concentration || null,
      interest_area: form.interest_area || null,
      build_stage: form.build_stage || null,
      project_name: form.project_name || null,
      project_url: form.project_url || null,
      resource_preferences: form.resource_preferences,
      onboarding_complete: true,
    }).eq('id', user.id)

    if (error) {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-1">
          <div className="flex gap-1 mb-6">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-zinc-900' : 'bg-zinc-200'}`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-400 uppercase tracking-widest">{`Step ${step + 1} of ${STEPS.length}`}</p>
          <h1 className="text-xl font-semibold">{STEPS[step]}</h1>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-1.5">
              <Label>Class year</Label>
              <Select value={form.class_year} onValueChange={v => update('class_year', v)}>
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
              <Input value={form.concentration} onChange={e => update('concentration', e.target.value)} placeholder="Computer Science" />
            </div>
            <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-700" onClick={() => setStep(1)} disabled={!form.full_name}>
              Continue
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Area of interest</Label>
              <Select value={form.interest_area} onValueChange={v => update('interest_area', v)}>
                <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                <SelectContent>
                  {INTEREST_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Where are you in your build?</Label>
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
                  <Label>Project name <span className="text-zinc-400">(optional)</span></Label>
                  <Input value={form.project_name} onChange={e => update('project_name', e.target.value)} placeholder="My Startup" />
                </div>
                <div className="space-y-1.5">
                  <Label>Website / link <span className="text-zinc-400">(optional)</span></Label>
                  <Input value={form.project_url} onChange={e => update('project_url', e.target.value)} placeholder="https://" type="url" />
                </div>
              </>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button className="flex-1 bg-zinc-900 text-white hover:bg-zinc-700" onClick={() => setStep(2)} disabled={!form.build_stage}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What would you like from Builders Club? <span className="text-zinc-400">(select all that apply)</span></Label>
              <div className="grid grid-cols-2 gap-2 pt-1">
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
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button
                className="flex-1 bg-zinc-900 text-white hover:bg-zinc-700"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Finish setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
