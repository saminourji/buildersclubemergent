import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
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

  return (
    <>
      <Nav profile={profile as Profile} />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '12px 16px' }}>
        {children}
      </div>
      <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '11px', color: '#828282' }}>
        builders club &mdash; emergent @ brown &mdash; est. 2025
      </div>
    </>
  )
}
