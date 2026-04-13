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
    <div style={{ maxWidth: 420, margin: '60px auto', padding: '0 16px' }}>
      <table style={{ border: '1px solid #b0c4d8', width: '100%', background: '#fff' }}>
        <tbody>
          <tr>
            <td style={{ background: '#87CEEB', padding: '4px 8px', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/logo.png" alt="B" style={{ height: 20, width: 20, imageRendering: 'pixelated' }} />
              <b style={{ color: '#000' }}>Builders Club</b>
              <span style={{ fontSize: 9, color: '#fff', background: '#5BA3C9', padding: '1px 4px', fontWeight: 'bold', letterSpacing: 0.5 }}>BETA</span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '16px 20px', border: 'none' }}>
              <p style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.6 }}>
                A weekly gathering for Brown students who are building — or want to start.
                Every Tuesday we share what we&apos;re working on, hear from builders in the room, and push each other.
                No pitches. No slides. Just builders.
              </p>
              <p style={{ fontSize: 11, color: '#828282', marginBottom: 10 }}>
                Tuesdays, 7–9 PM · Nelson Center, 4th floor · Run by{' '}
                <a href="https://emergentconference.org" target="_blank" rel="noopener noreferrer">Emergent</a> @ Brown.
              </p>
              <hr />
              <p style={{ marginBottom: 10, marginTop: 10, fontSize: 12 }}>
                Sign in with your Brown University Google account to access the member platform.
              </p>
              <button
                onClick={handleLogin}
                style={{
                  background: '#87CEEB',
                  color: '#000',
                  border: '1px solid #5BA3C9',
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
      <p style={{ marginTop: 10, fontSize: 11, color: '#828282', textAlign: 'center' }}>
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
