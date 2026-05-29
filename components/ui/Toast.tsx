'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error'

export type ToastMessage = {
  id: string
  type: ToastType
  message: string
}

type ToastProps = {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const isSuccess = toast.type === 'success'

  return (
    <div
      style={{
        pointerEvents: 'all',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: 'var(--surface)',
        border: `1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        minWidth: 260,
        maxWidth: 360,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {isSuccess ? (
        <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0 }} />
      ) : (
        <XCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
      )}
      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={13} />
      </button>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return { toasts, addToast, removeToast, success: (m: string) => addToast('success', m), error: (m: string) => addToast('error', m) }
}
