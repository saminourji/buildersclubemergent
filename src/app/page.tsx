import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Signed-in users should go straight into the app.
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding_complete) redirect('/onboarding')
    redirect('/dashboard')
  }

  return (
    <div style={{ maxWidth: 720, margin: '60px auto', padding: '0 16px' }}>
      <table style={{ border: '1px solid #b0c4d8', width: '100%', background: '#fff' }}>
        <tbody>
          <tr>
            <td style={{ background: '#87CEEB', padding: '6px 10px', border: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo.png" alt="B" style={{ height: 22, width: 22, imageRendering: 'pixelated' }} />
              <b style={{ color: '#000' }}>Builders Club</b>
              <span style={{ fontSize: 9, color: '#fff', background: '#5BA3C9', padding: '1px 4px', fontWeight: 'bold', letterSpacing: 0.5 }}>BETA</span>
              <span style={{ marginLeft: 'auto', fontSize: 11 }}>
                <a href="https://emergentconference.org" target="_blank" rel="noopener noreferrer">Emergent</a>
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '16px 20px', border: 'none' }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                <b>Builders Club</b>{' '}is a community for Brown students who are building in tech, or want to start.
                Every Tuesday we meet, share what we&apos;re working on, sometimes hear from speakers, and build for the rest of the time.
              </p>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                Tuesdays, 7–9 PM · Nelson Center, 4th floor
              </p>

              <div style={{ border: '1px solid #d4a574', background: '#fef9f0', padding: '10px 12px', marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#8b5e3c' }}>
                  <b>Directory + Resources are unlocked after you attend at least 1 meeting.</b>
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <Link
                  href="/login"
                  style={{
                    background: '#87CEEB',
                    color: '#000',
                    border: '1px solid #5BA3C9',
                    padding: '6px 16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 13,
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  sign in with google
                </Link>
                <span style={{ fontSize: 11, color: '#828282' }}>
                  by signing in, you&apos;ll create your member profile
                </span>
              </div>

              <hr />
              <p style={{ fontSize: 11, color: '#828282', margin: 0 }}>
                <Link href="/privacy">privacy</Link>
                {' · '}
                <Link href="/terms">terms</Link>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
