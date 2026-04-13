'use client'

import { toast } from 'sonner'

export function CheckinCodeDisplay({ code }: { code: string }) {
  function copyCode() {
    navigator.clipboard.writeText(code)
    toast.success('Code copied')
  }

  return (
    <div>
      <div style={{
        display: 'inline-block',
        border: '2px solid #000',
        background: '#fff',
        padding: '12px 24px',
        fontFamily: 'monospace',
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: 8,
        userSelect: 'all',
      }}>
        {code}
      </div>
      <p style={{ marginTop: 8, fontSize: 11 }}>
        <a onClick={copyCode} style={{ cursor: 'pointer' }}>[copy code]</a>
        {' '}
        <span style={{ color: '#828282' }}>— members enter this code on the meeting page to check in</span>
      </p>
    </div>
  )
}
