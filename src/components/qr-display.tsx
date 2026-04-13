'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export function QRDisplay({ url, token }: { url: string; token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 160,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
    }
  }, [url])

  return (
    <div>
      <div style={{ border: '1px solid #ccc', display: 'inline-block', padding: 8, background: '#fff' }}>
        <canvas ref={canvasRef} />
      </div>
      <p style={{ fontSize: 11, marginTop: 8 }}>
        URL: <code style={{ fontSize: 11 }}>{url}</code>
      </p>
      <p style={{ marginTop: 4 }}>
        <a
          onClick={() => navigator.clipboard.writeText(url).then(() => alert('Copied!'))}
          style={{ cursor: 'pointer', fontSize: 11 }}
        >
          [copy link]
        </a>
        {' '}
        <a
          onClick={() => {
            if (canvasRef.current) {
              const link = document.createElement('a')
              link.download = `qr-${token.slice(0, 8)}.png`
              link.href = canvasRef.current.toDataURL()
              link.click()
            }
          }}
          style={{ cursor: 'pointer', fontSize: 11 }}
        >
          [download png]
        </a>
      </p>
    </div>
  )
}
