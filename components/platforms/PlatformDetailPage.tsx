'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowRight, ChevronLeft, Pencil, Save, X } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import PlatformIcon from '@/components/ui/PlatformIcon'

type Account = {
  id: string
  name: string
  username: string | null
  phone: string | null
  status: string
  totalDays: number
  createdAt: string
  days: { status: string }[]
}

type Platform = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

type Label = {
  id: string
  name: string
  color: string
  platformId: string | null
}

type Props = { platformId: string }

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#6b7280', '#14b8a6', '#0ea5e9',
]

export default function PlatformDetailPage({ platformId }: Props) {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'accounts' | 'categories'>('accounts')
  const router = useRouter()

  const isWhatsApp = platform?.icon?.toLowerCase() === 'whatsapp'

  const loadPlatform = () =>
    fetch('/api/platforms')
      .then((r) => r.json())
      .then((all: Platform[]) => setPlatform(all.find((p) => p.id === platformId) || null))

  const loadAccounts = () =>
    fetch(`/api/accounts?platformId=${platformId}`)
      .then((r) => r.json())
      .then(setAccounts)

  const loadLabels = () =>
    fetch(`/api/labels?platformId=${platformId}`)
      .then((r) => r.json())
      .then(setLabels)

  useEffect(() => {
    loadPlatform()
    loadAccounts()
    loadLabels()
  }, [platformId])

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar conta e todos os dados?')) return
    await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
    loadAccounts()
  }

  const getProgress = (acc: Account) => {
    const completed = acc.days.filter((d) => d.status === 'completed').length
    return { completed, total: acc.totalDays, pct: acc.totalDays ? Math.round((completed / acc.totalDays) * 100) : 0 }
  }

  return (
    <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button className="btn btn-ghost" style={{ padding: '4px 6px' }} onClick={() => router.push('/platforms')}>
          <ChevronLeft size={16} />
        </button>
        <PlatformIcon name={platform?.icon || 'default'} size={28} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em' }}>
            {platform?.name || '...'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
          </p>
        </div>
        <div style={{ flex: 1 }} />
        {activeTab === 'accounts' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Nova conta
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[
          { key: 'accounts', label: 'Contas' },
          { key: 'categories', label: 'Categorias' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'accounts' | 'categories')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
            {tab.key === 'accounts' && (
              <span style={{ marginLeft: 6, fontSize: 11, background: 'var(--surface-hover)', borderRadius: 10, padding: '1px 6px', color: 'var(--text-muted)' }}>
                {accounts.length}
              </span>
            )}
            {tab.key === 'categories' && (
              <span style={{ marginLeft: 6, fontSize: 11, background: 'var(--surface-hover)', borderRadius: 10, padding: '1px 6px', color: 'var(--text-muted)' }}>
                {labels.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Contas */}
      {activeTab === 'accounts' && (
        <>
          {accounts.length === 0 && (
            <div className="card" style={{ padding: 48, textAlign: 'center', borderStyle: 'dashed' }}>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Nenhuma conta</p>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 13 }}>
                Adicione sua primeira conta para começar o aquecimento.
              </p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={14} /> Criar conta
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gap: 10 }}>
            {accounts.map((acc) => {
              const { completed, total, pct } = getProgress(acc)
              const subtitle = isWhatsApp
                ? acc.phone || 'Sem número'
                : acc.username || null

              return (
                <div
                  key={acc.id}
                  className="card"
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
                  onClick={() => router.push(`/account/${acc.id}`)}
                >
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'var(--surface-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 16, color: 'var(--text-secondary)',
                      flexShrink: 0, border: '1.5px solid var(--border)',
                    }}
                  >
                    {acc.name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{acc.name}</p>
                      <StatusBadge status={acc.status} />
                    </div>
                    {subtitle && (
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                        {isWhatsApp ? '📱 ' : '@'}{subtitle}
                      </p>
                    )}
                  </div>

                  <div style={{ width: 120, flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progresso</span>
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#3b82f6' }} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{completed}/{total} dias</p>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '4px 6px', color: '#ef4444' }}
                      onClick={() => handleDelete(acc.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Tab: Categorias */}
      {activeTab === 'categories' && (
        <CategoriesTab platformId={platformId} labels={labels} onReload={loadLabels} />
      )}

      {showModal && platform && (
        <CreateAccountModal
          platformId={platformId}
          isWhatsApp={isWhatsApp}
          onClose={() => setShowModal(false)}
          onSave={(id) => { setShowModal(false); router.push(`/account/${id}`) }}
        />
      )}
    </div>
  )
}

/* ---- CATEGORIES TAB ---- */
function CategoriesTab({ platformId, labels, onReload }: { platformId: string; labels: Label[]; onReload: () => void }) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6b7280')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const create = async () => {
    if (!newName.trim()) return
    await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, color: newColor, platformId }),
    })
    setNewName('')
    onReload()
  }

  const update = async (id: string) => {
    await fetch(`/api/labels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, color: editColor }),
    })
    setEditingId(null)
    onReload()
  }

  const remove = async (id: string) => {
    if (!confirm('Deletar etiqueta?')) return
    await fetch(`/api/labels/${id}`, { method: 'DELETE' })
    onReload()
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Etiquetas específicas desta plataforma. Use-as para categorizar suas contas.
      </p>

      {/* Create */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Nova etiqueta
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            className="input"
            placeholder="Nome da etiqueta..."
            value={newName}
            style={{ flex: 1 }}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
          />
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            style={{ width: 36, height: 34, border: '1px solid var(--border)', borderRadius: 6, padding: 2, cursor: 'pointer', background: 'var(--surface)' }}
          />
          <button className="btn btn-primary" style={{ padding: '6px 10px' }} onClick={create} disabled={!newName.trim()}>
            <Plus size={13} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(c => (
            <div
              key={c}
              onClick={() => setNewColor(c)}
              style={{ width: 20, height: 20, borderRadius: 5, background: c, cursor: 'pointer', border: newColor === c ? '2px solid var(--text-primary)' : '2px solid transparent' }}
            />
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {labels.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)' }}>
            {editingId === l.id ? (
              <>
                <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4 }} />
                <input className="input" value={editName} style={{ flex: 1, fontSize: 13 }} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && update(l.id)} autoFocus />
                <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => update(l.id)}><Save size={12} /></button>
                <button className="btn btn-ghost" style={{ padding: '4px 6px' }} onClick={() => setEditingId(null)}><X size={12} /></button>
              </>
            ) : (
              <>
                <span className="badge" style={{ background: l.color + '22', color: l.color, borderColor: l.color + '55', fontWeight: 600, fontSize: 13 }}>{l.name}</span>
                <div style={{ flex: 1 }} />
                <button className="btn btn-ghost" style={{ padding: '3px 5px' }} onClick={() => { setEditingId(l.id); setEditName(l.name); setEditColor(l.color) }}><Pencil size={13} /></button>
                <button className="btn btn-ghost" style={{ padding: '3px 5px', color: '#ef4444' }} onClick={() => remove(l.id)}><Trash2 size={13} /></button>
              </>
            )}
          </div>
        ))}
        {labels.length === 0 && (
          <div className="card" style={{ padding: 36, textAlign: 'center', borderStyle: 'dashed' }}>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Nenhuma etiqueta</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Crie a primeira etiqueta acima para começar a categorizar contas.</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---- CREATE ACCOUNT MODAL ---- */
function CreateAccountModal({
  platformId,
  isWhatsApp,
  onClose,
  onSave,
}: {
  platformId: string
  isWhatsApp: boolean
  onClose: () => void
  onSave: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totalDays, setTotalDays] = useState(30)
  const [totpSecret, setTotpSecret] = useState('')
  const [loading, setLoading] = useState(false)

  const presets = [7, 15, 30, 45, 60]

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platformId,
        name,
        username: isWhatsApp ? null : email,
        password: isWhatsApp ? null : password,
        phone: isWhatsApp ? phone : null,
        totalDays,
        totpSecret: totpSecret || null,
      }),
    })
    const created = await res.json()
    setLoading(false)
    onSave(created.id)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
          {isWhatsApp ? 'Novo número WhatsApp' : 'Nova conta'}
        </h2>

        <div style={{ marginBottom: 14 }}>
          <label className="label">Nome da conta *</label>
          <input
            className="input"
            placeholder={isWhatsApp ? 'Ex: Conta Principal, Número 01...' : 'Ex: Conta Principal...'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        {isWhatsApp ? (
          <div style={{ marginBottom: 14 }}>
            <label className="label">Número de telefone</label>
            <input
              className="input"
              placeholder="+55 11 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label className="label">Email / Login</label>
                <input
                  className="input"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Senha</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">Chave TOTP (2FA) — opcional</label>
              <input
                className="input"
                placeholder="Chave secreta do Google Authenticator..."
                value={totpSecret}
                onChange={(e) => setTotpSecret(e.target.value)}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: 20 }}>
          <label className="label">Dias de aquecimento</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {presets.map((p) => (
              <button
                key={p}
                className={`btn ${totalDays === p ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, padding: '4px 12px' }}
                onClick={() => setTotalDays(p)}
              >
                {p}d
              </button>
            ))}
          </div>
          <input
            className="input"
            type="number"
            min={1}
            max={365}
            value={totalDays}
            onChange={(e) => setTotalDays(Number(e.target.value))}
            placeholder="Número de dias"
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading || !name.trim()}>
            {loading ? 'Criando...' : isWhatsApp ? 'Criar número' : 'Criar conta'}
          </button>
        </div>
      </div>
    </div>
  )
}
