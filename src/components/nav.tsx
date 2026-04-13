'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

const GATED_LINKS = new Set(['/directory', '/resources'])

const NAV_LINKS = [
  { href: '/dashboard', label: 'home' },
  { href: '/directory', label: 'directory' },
  { href: '/meetings', label: 'meetings' },
  { href: '/resources', label: 'resources' },
  { href: '/profile', label: 'profile' },
]

export function Nav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ background: '#87CEEB', padding: '2px 8px' }}>
      <table style={{ border: 'none', width: '100%' }}>
        <tbody>
          <tr style={{ background: 'transparent' }}>
            <td style={{ border: 'none', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                <img src="/logo.png" alt="B" style={{ height: 20, width: 20, imageRendering: 'pixelated' }} />
              </Link>
              <b>
                <Link href="/dashboard" style={{ color: '#000', textDecoration: 'none' }}>
                  Builders Club
                </Link>
              </b>
              {' | '}
              {NAV_LINKS.map(({ href, label }, i) => {
                const locked = GATED_LINKS.has(href) && !profile.is_verified
                return (
                  <span key={href}>
                    {i > 0 && ' | '}
                    {locked ? (
                      <span style={{ color: '#999' }} title="Attend a meeting to unlock">
                        {label}
                      </span>
                    ) : (
                      <Link
                        href={href}
                        style={{
                          color: '#000',
                          fontWeight: pathname.startsWith(href) ? 'bold' : 'normal',
                          textDecoration: pathname.startsWith(href) ? 'none' : 'underline',
                        }}
                      >
                        {label}
                      </Link>
                    )}
                  </span>
                )
              })}
              {profile.is_admin && (
                <>
                  {' | '}
                  <Link
                    href="/admin"
                    style={{
                      color: '#000',
                      fontWeight: pathname.startsWith('/admin') ? 'bold' : 'normal',
                      textDecoration: pathname.startsWith('/admin') ? 'none' : 'underline',
                    }}
                  >
                    admin
                  </Link>
                </>
              )}
            </td>
            <td style={{ border: 'none', padding: '4px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '12px' }}>
                {profile.full_name ?? profile.email}
                {' | '}
                <a onClick={handleSignOut} style={{ color: '#000', cursor: 'pointer', textDecoration: 'underline' }}>logout</a>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
