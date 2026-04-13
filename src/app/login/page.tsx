'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  async function handleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <table style={{ border: '1px solid #ccc', width: '100%', background: '#fff' }}>
        <tbody>
          <tr>
            <td style={{ background: '#ff6600', padding: '4px 8px', border: 'none' }}>
              <b style={{ color: '#000' }}>Builders Club</b>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '20px', border: 'none' }}>
              <p style={{ marginBottom: 8 }}>
                Welcome to the <b>Builders Club</b> member platform.<br />
                Emergent @ Brown University.
              </p>
              <hr />
              <p style={{ marginBottom: 12, fontSize: 12 }}>
                Sign in with your Brown University Google account to continue.
              </p>
              <button
                onClick={handleLogin}
                style={{
                  background: '#ff6600',
                  color: '#000',
                  border: '1px solid #cc5200',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 13,
                }}
              >
                login with google
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ marginTop: 12, fontSize: 11, color: '#828282', textAlign: 'center' }}>
        by signing in you agree to be a builder, not just a talker
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
