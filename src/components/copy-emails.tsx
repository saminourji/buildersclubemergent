'use client'

import { toast } from 'sonner'

export function CopyEmails({ allEmails, verifiedEmails, unverifiedEmails }: {
  allEmails: string[]; verifiedEmails: string[]; unverifiedEmails: string[]
}) {
  function copy(emails: string[]) {
    navigator.clipboard.writeText(emails.join(', '))
    toast.success(`Copied ${emails.length} emails`)
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, marginBottom: 4 }}>
          <b>All members</b> ({allEmails.length})
        </p>
        <div style={{ border: '1px solid #b0c4d8', background: '#fff', padding: 8, fontSize: 11, maxHeight: 80, overflow: 'auto', marginBottom: 4, wordBreak: 'break-all', color: '#666' }}>
          {allEmails.join(', ') || 'no members yet'}
        </div>
        <button
          onClick={() => copy(allEmails)}
          disabled={allEmails.length === 0}
          style={{ background: '#87CEEB', color: '#000', border: '1px solid #5BA3C9', padding: '4px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}
        >
          copy all emails
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, marginBottom: 4 }}>
          <b>Verified members</b> ({verifiedEmails.length})
        </p>
        <div style={{ border: '1px solid #b0c4d8', background: '#fff', padding: 8, fontSize: 11, maxHeight: 80, overflow: 'auto', marginBottom: 4, wordBreak: 'break-all', color: '#666' }}>
          {verifiedEmails.join(', ') || 'no verified members yet'}
        </div>
        <button
          onClick={() => copy(verifiedEmails)}
          disabled={verifiedEmails.length === 0}
          style={{ background: '#87CEEB', color: '#000', border: '1px solid #5BA3C9', padding: '4px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}
        >
          copy verified emails
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, marginBottom: 4 }}>
          <b>Unverified members</b> ({unverifiedEmails.length})
        </p>
        <div style={{ border: '1px solid #b0c4d8', background: '#fff', padding: 8, fontSize: 11, maxHeight: 80, overflow: 'auto', marginBottom: 4, wordBreak: 'break-all', color: '#666' }}>
          {unverifiedEmails.join(', ') || 'no unverified members'}
        </div>
        <button
          onClick={() => copy(unverifiedEmails)}
          disabled={unverifiedEmails.length === 0}
          style={{ background: '#d4e6f1', color: '#000', border: '1px solid #b0c4d8', padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}
        >
          copy unverified emails
        </button>
      </div>
    </div>
  )
}
