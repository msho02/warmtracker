'use client'

import { useState, useEffect } from 'react'
import { Shield, Copy, Check } from 'lucide-react'

export default function TOTPWidget({ secret }: { secret: string }) {
  const [code, setCode] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(30)
  const [copied, setCopied] = useState(false)

  const fetchCode = async () => {
    try {
      const r = await fetch('/api/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      const data = await r.json()
      if (data.code) {
        setCode(data.code)
        setRemaining(data.remaining)
      }
    } catch {}
  }

  useEffect(() => {
    fetchCode()
    const interval = setInterval(() => {
      const r = 30 - (Math.floor(Date.now() / 1000) % 30)
      setRemaining(r)
      if (r === 30) fetchCode()
    }, 1000)
    return () => clearInterval(interval)
  }, [secret])

  const copy = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const pct = ((30 - remaining) / 30) * 100
  const urgent = remaining <= 5

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--surface)',
        border: `1.5px solid ${urgent ? '#fca5a5' : 'var(--border)'}`,
        borderRadius: 10,
        padding: '8px 14px',
        transition: 'border-color 0.3s',
      }}
    >
      <Shield size={15} color={urgent ? '#ef4444' : '#3b82f6'} />

      <div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Código 2FA</p>
        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.15em',
            fontFamily: 'monospace',
            color: urgent ? '#ef4444' : 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {code ? `${code.slice(0, 3)} ${code.slice(3)}` : '--- ---'}
        </p>
      </div>

      {/* Progress ring */}
      <div style={{ position: 'relative', width: 28, height: 28 }}>
        <svg width="28" height="28" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="14" cy="14" r="10" fill="none" stroke="var(--border)" strokeWidth="2.5" />
          <circle
            cx="14"
            cy="14"
            r="10"
            fill="none"
            stroke={urgent ? '#ef4444' : '#3b82f6'}
            strokeWidth="2.5"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 700,
            color: urgent ? '#ef4444' : 'var(--text-muted)',
          }}
        >
          {remaining}
        </span>
      </div>

      <button
        className="btn btn-ghost"
        style={{ padding: '4px 8px' }}
        onClick={copy}
        title="Copiar código"
      >
        {copied ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
      </button>
    </div>
  )
}
