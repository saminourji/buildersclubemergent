'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

const GATED_LINKS = new Set(['/directory', '/resources'])

const NAV_LINKS = [
  { href: '/dashboard', label: 'home' },
  { href: '/meetings', label: 'meetings' },
  { href: '/directory', label: 'directory' },
  { href: '/resources', label: 'resources' },
]

export function Nav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const firstName = profile.full_name?.split(' ')[0] ?? profile.email.split('@')[0]

  return (
    <nav style={{ background: '#87CEEB', padding: '0 12px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 36 }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', flexShrink: 0 }}>
          <img src="/logo.png" alt="B" style={{ height: 18, width: 18, imageRendering: 'pixelated' }} />
              <b style={{ color: '#000', fontSize: 13 }} className="hide-mobile">Builders Club</b>
              <span style={{ fontSize: 9, color: '#fff', background: '#5BA3C9', padding: '1px 4px', fontWeight: 'bold', letterSpacing: 0.5, verticalAlign: 'middle' }} className="hide-mobile">BETA</span>
        </Link>

        {/* Center links — desktop */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {NAV_LINKS.map(({ href, label }, i) => {
            const locked = GATED_LINKS.has(href) && !profile.is_verified
            return (
              <span key={href} style={{ fontSize: 12 }}>
                {i > 0 && <span style={{ margin: '0 4px', color: '#5BA3C9' }}>|</span>}
                {locked ? (
                  <span style={{ color: '#7ab5cc' }} title="Attend a meeting to unlock">{label}</span>
                ) : (
                  <Link href={href} style={{
                    color: '#000',
                    fontWeight: pathname.startsWith(href) ? 'bold' : 'normal',
                    textDecoration: pathname.startsWith(href) ? 'none' : 'underline',
                  }}>{label}</Link>
                )}
              </span>
            )
          })}
        </div>

        {/* Right: name dropdown + mobile hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Name dropdown — desktop */}
          <div className="hide-mobile" style={{ position: 'relative' }}>
            <a
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: 'pointer', fontSize: 12, color: '#000', textDecoration: 'underline', userSelect: 'none' }}
            >
              {firstName} ▾
            </a>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 22, background: '#fff',
                border: '1px solid #b0c4d8', padding: 4, zIndex: 100, minWidth: 130,
                boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
              }}>
                <DropLink href="/profile" label="profile" onClick={() => setDropdownOpen(false)} />
                {profile.is_admin && <DropLink href="/admin" label="admin panel" onClick={() => setDropdownOpen(false)} />}
                <div style={{ borderTop: '1px solid #b0c4d8', margin: '4px 0' }} />
                <a onClick={() => { setDropdownOpen(false); handleSignOut() }}
                  style={{ display: 'block', padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#a52a2a' }}>
                  logout
                </a>
              </div>
            )}
          </div>

          {/* Hamburger — mobile */}
          <a
            className="show-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ cursor: 'pointer', fontSize: 18, color: '#000', lineHeight: 1, display: 'none', userSelect: 'none' }}
          >
            {menuOpen ? '✕' : '☰'}
          </a>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="show-mobile" style={{
          display: 'none', flexDirection: 'column', borderTop: '1px solid #5BA3C9',
          paddingBottom: 8, background: '#87CEEB',
        }}>
          {NAV_LINKS.map(({ href, label }) => {
            const locked = GATED_LINKS.has(href) && !profile.is_verified
            return locked ? (
              <span key={href} style={{ padding: '4px 8px', fontSize: 12, color: '#7ab5cc' }}>{label}</span>
            ) : (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                padding: '4px 8px', fontSize: 12, color: '#000',
                fontWeight: pathname.startsWith(href) ? 'bold' : 'normal',
                textDecoration: 'none',
              }}>{label}</Link>
            )
          })}
          <div style={{ borderTop: '1px solid #5BA3C9', margin: '4px 0' }} />
          <Link href="/profile" onClick={() => setMenuOpen(false)}
            style={{ padding: '4px 8px', fontSize: 12, color: '#000', textDecoration: 'none' }}>profile</Link>
          {profile.is_admin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}
              style={{ padding: '4px 8px', fontSize: 12, color: '#000', textDecoration: 'none' }}>admin panel</Link>
          )}
          <a onClick={() => { setMenuOpen(false); handleSignOut() }}
            style={{ padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: '#a52a2a' }}>logout</a>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 601px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}

function DropLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      style={{ display: 'block', padding: '3px 8px', fontSize: 11, color: '#000', textDecoration: 'none' }}>
      {label}
    </Link>
  )
}
