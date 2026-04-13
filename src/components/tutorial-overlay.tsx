'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  {
    title: 'Welcome to Builders Club',
    body: 'This is your member platform. We meet every Tuesday, 7–9 PM. Let\'s show you around.',
    highlight: null,
  },
  {
    title: 'Home',
    body: 'Your dashboard. See the next meeting, your stats, and quick actions like requesting a demo slot.',
    highlight: 'home',
  },
  {
    title: 'Meetings',
    body: 'View all past and upcoming meetings. When check-in opens, enter the code announced at the meeting to mark your attendance.',
    highlight: 'meetings',
  },
  {
    title: 'Directory',
    body: 'Browse other members, see what they\'re building, and find potential collaborators. Unlocked after your first meeting.',
    highlight: 'directory',
  },
  {
    title: 'Resources',
    body: 'Curated links including the Slack workspace, funding guides, and reading material. Also unlocked after your first meeting.',
    highlight: 'resources',
  },
  {
    title: 'Your Profile',
    body: 'Click your name in the top right to edit your profile, upload a picture, or access the admin panel (if you\'re an admin).',
    highlight: 'profile',
  },
  {
    title: 'Demo Presentations',
    body: 'Want to show what you\'re building? Request a demo slot on any meeting page. Admins approve up to 3 per week.',
    highlight: null,
  },
  {
    title: 'You\'re all set!',
    body: 'That\'s it. Go build something. We\'ll see you Tuesday.',
    highlight: null,
  },
]

export function TutorialOverlay({ userId }: { userId: string }) {
  const [step, setStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  async function finish() {
    setDismissed(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ tutorial_complete: true }).eq('id', userId)
  }

  function next() {
    if (step >= STEPS.length - 1) {
      finish()
    } else {
      setStep(s => s + 1)
    }
  }

  function skip() {
    finish()
  }

  if (dismissed) return null

  const current = STEPS[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#f0f4f8',
        border: '2px solid #87CEEB',
        maxWidth: 420,
        width: '100%',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
      }}>
        {/* Title bar */}
        <div style={{
          background: '#87CEEB',
          padding: '4px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <b style={{ fontSize: 12, color: '#000' }}>
            {current.title}
          </b>
          <span style={{ fontSize: 11, color: '#444' }}>
            {step + 1}/{STEPS.length}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 16px 12px' }}>
          {current.highlight && (
            <p style={{
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#87CEEB',
              background: '#1a1a1a',
              display: 'inline-block',
              padding: '2px 8px',
              marginBottom: 8,
            }}>
              → {current.highlight}
            </p>
          )}
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>{current.body}</p>
        </div>

        {/* Actions */}
        <div style={{
          padding: '8px 16px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <a onClick={skip} style={{ fontSize: 11, color: '#828282', cursor: 'pointer' }}>
            skip tutorial
          </a>
          <button
            onClick={next}
            style={{
              background: '#87CEEB',
              color: '#000',
              border: '1px solid #5BA3C9',
              padding: '4px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 12,
            }}
          >
            {step >= STEPS.length - 1 ? 'get started' : 'next →'}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#d4e6f1' }}>
          <div style={{
            height: 3,
            background: '#87CEEB',
            width: `${((step + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.2s',
          }} />
        </div>
      </div>
    </div>
  )
}
