import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { TutorialOverlay } from '@/components/tutorial-overlay'
import { Profile } from '@/types/database'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarding_complete) redirect('/onboarding')

  const showTutorial = !profile.tutorial_complete

  return (
    <>
      <Nav profile={profile as Profile} />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '12px 16px' }}>
        {children}
      </div>
      <div style={{ textAlign: 'center', padding: '20px 0 6px', fontSize: '11px', color: '#828282' }}>
        Builders Club{' \u2014 '}
        <a href="https://emergentconference.org" target="_blank" rel="noopener noreferrer" style={{ color: '#828282' }}>
          Emergent
        </a>
        {' \u2014 est. March 2026'}
      </div>
      <div style={{ textAlign: 'center', paddingBottom: 20, fontSize: '10px', color: '#aaa' }}>
        fully vibecoded by sami nourji
        <div style={{ marginTop: 4, fontSize: 9, color: '#b5b5b5' }}>
          <a href="/terms" style={{ color: '#b5b5b5' }}>terms</a>
          {' | '}
          <a href="/privacy" style={{ color: '#b5b5b5' }}>privacy</a>
        </div>
      </div>
      {showTutorial && <TutorialOverlay userId={user.id} />}
    </>
  )
}
