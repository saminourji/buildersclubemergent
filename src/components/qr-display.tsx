'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export function QRDisplay({ url, token }: { url: string; token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: { dark: '#09090b', light: '#ffffff' },
      })
    }
  }, [url])

  return (
    <div className="flex flex-col gap-3">
      <div className="border border-zinc-100 rounded-lg p-4 w-fit">
        <canvas ref={canvasRef} />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-zinc-400">Check-in URL</p>
        <code className="text-xs font-mono text-zinc-600 break-all">{url}</code>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(url).then(() => alert('Copied!'))}
          className="text-xs px-3 py-1.5 border border-zinc-200 rounded-md hover:border-zinc-400 transition-colors"
        >
          Copy link
        </button>
        <button
          onClick={() => {
            if (canvasRef.current) {
              const link = document.createElement('a')
              link.download = `checkin-qr-${token.slice(0, 8)}.png`
              link.href = canvasRef.current.toDataURL()
              link.click()
            }
          }}
          className="text-xs px-3 py-1.5 border border-zinc-200 rounded-md hover:border-zinc-400 transition-colors"
        >
          Download QR
        </button>
      </div>
    </div>
  )
}
