'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Users, ArrowRight } from 'lucide-react'
import { PLATFORM_ICONS, PLATFORM_ICON_LABELS } from '@/lib/utils'
import PlatformIcon from '@/components/ui/PlatformIcon'

type Platform = {
  id: string
  name: string
  icon: string | null
  color: string | null
  _count: { accounts: number }
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Platform | null>(null)
  const router = useRouter()

  const load = () =>
    fetch('/api/platforms')
      .then((r) => r.json())
      .then(setPlatforms)

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar plataforma e todas as contas?')) return
    await fetch(`/api/platforms/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em' }}>
            Redes Sociais
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
            Gerencie suas plataformas de aquecimento
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setShowModal(true) }}
        >
          <Plus size={14} />
          Nova plataforma
        </button>
      </div>

      {platforms.length === 0 && (
        <div
          className="card"
          style={{ padding: 48, textAlign: 'center', borderStyle: 'dashed' }}
        >
          <p style={{ fontSize: 32, marginBottom: 12 }}>🌐</p>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Nenhuma plataforma</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 13 }}>
            Adicione sua primeira plataforma para organizar o aquecimento.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => { setEditing(null); setShowModal(true) }}
          >
            <Plus size={14} /> Criar plataforma
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {platforms.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: '20px',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = 'var(--shadow-md)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = '')
            }
            onClick={() => router.push(`/platform/${p.id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: p.color ? `${p.color}20` : 'var(--surface-hover)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  border: p.color ? `1.5px solid ${p.color}30` : '1.5px solid var(--border)',
                }}
              >
                <PlatformIcon name={p.icon || 'default'} size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                  {p._count.accounts} {p._count.accounts === 1 ? 'conta' : 'contas'}
                </p>
              </div>
              <div
                style={{ display: 'flex', gap: 4 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn btn-ghost"
                  style={{ padding: '4px 6px' }}
                  onClick={() => { setEditing(p); setShowModal(true) }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '4px 6px', color: '#ef4444' }}
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--text-muted)',
                fontSize: 12,
              }}
            >
              <Users size={12} />
              <span>Ver contas</span>
              <ArrowRight size={12} style={{ marginLeft: 'auto' }} />
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <PlatformModal
          platform={editing}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}

function PlatformModal({
  platform,
  onClose,
  onSave,
}: {
  platform: Platform | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(platform?.name || '')
  const [icon, setIcon] = useState(platform?.icon || '')
  const [color, setColor] = useState(platform?.color || '')
  const [loading, setLoading] = useState(false)

  const presetIcons = Object.entries(PLATFORM_ICONS)

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    if (platform) {
      await fetch(`/api/platforms/${platform.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon, color }),
      })
    } else {
      await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon, color }),
      })
    }
    setLoading(false)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
          {platform ? 'Editar plataforma' : 'Nova plataforma'}
        </h2>

        <div style={{ marginBottom: 14 }}>
          <label className="label">Nome</label>
          <input
            className="input"
            placeholder="Ex: WhatsApp, Instagram..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="label">Ícone da rede social</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {presetIcons.map(([k]) => (
              <button
                key={k}
                title={PLATFORM_ICON_LABELS[k] || k}
                onClick={() => setIcon(k)}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: icon === k ? 'var(--surface-hover)' : 'transparent',
                  border: `1.5px solid ${icon === k ? 'var(--border-strong)' : 'var(--border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <PlatformIcon name={k} size={20} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Cor (opcional)</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="input"
              placeholder="#3b82f6"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ flex: 1 }}
            />
            {color && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: color,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : platform ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  )
}
