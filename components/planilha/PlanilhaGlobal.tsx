'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Table2, Plus, Pencil, Save, X, Trash2, ExternalLink, Tag, Eye, EyeOff } from 'lucide-react'
import PlatformIcon from '@/components/ui/PlatformIcon'

type Label = { id: string; name: string; color: string; platformId: string | null }
type Platform = { id: string; name: string; icon: string | null }
type AccountRow = {
  id: string
  name: string
  username: string | null
  password: string | null
  status: string
  totalDays: number
  slot: number | null
  phone: string | null
  categoryId: string | null
  category: Label | null
  stock: number | null
  supplier: string | null
  planPaymentDate: string | null
  annotations: string | null
  platform: Platform
  completedDays: number
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#6b7280', '#14b8a6', '#0ea5e9',
]

export default function PlanilhaGlobal() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<AccountRow[]>([])
  const [allLabels, setAllLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [showLabelManager, setShowLabelManager] = useState(false)
  const [labelManagerPlatformId, setLabelManagerPlatformId] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ accountId: string; field: string } | null>(null)
  const [cellValues, setCellValues] = useState<Record<string, Record<string, string>>>({})
  const [openLabelGrid, setOpenLabelGrid] = useState<{ accountId: string; platformId: string; rect: DOMRect } | null>(null)
  const [hideSensitive, setHideSensitive] = useState(false)

  const loadData = useCallback(async () => {
    const [accRes, labRes] = await Promise.all([
      fetch('/api/accounts'),
      fetch('/api/labels'),
    ])
    const accData = await accRes.json()
    const labData = await labRes.json()
    setAllLabels(labData)

    const rows: AccountRow[] = accData.map((a: AccountRow & { days: { status: string }[] }) => ({
      ...a,
      completedDays: a.days?.filter((d) => d.status === 'completed').length ?? 0,
    }))
    setAccounts(rows)

    const seen = new Set<string>()
    const plats: Platform[] = []
    rows.forEach((r) => {
      if (!seen.has(r.platform.id)) {
        seen.add(r.platform.id)
        plats.push(r.platform)
      }
    })
    setPlatforms(plats)

    const vals: Record<string, Record<string, string>> = {}
    rows.forEach((r) => {
      vals[r.id] = {
        name: r.name ?? '',
        username: r.username ?? '',
        password: r.password ?? '',
        slot: r.slot != null ? String(r.slot) : '',
        phone: r.phone ?? '',
        stock: r.stock != null ? String(r.stock) : '',
        supplier: r.supplier ?? '',
        planPaymentDate: r.planPaymentDate ?? '',
        annotations: r.annotations ?? '',
        categoryId: r.categoryId ?? '',
        status: r.status ?? 'not_started',
      }
    })
    setCellValues(vals)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const saveField = async (accountId: string, field: string, value: string | number | null) => {
    await fetch(`/api/accounts/${accountId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    await loadData()
    setEditingCell(null)
  }

  const updateCellVal = (accountId: string, field: string, value: string) => {
    setCellValues(prev => ({
      ...prev,
      [accountId]: { ...prev[accountId], [field]: value },
    }))
  }

  const filtered = filterPlatform === 'all'
    ? accounts
    : accounts.filter(a => a.platform.id === filterPlatform)

  const isWhatsApp = (a: AccountRow) => a.platform.icon?.toLowerCase() === 'whatsapp'

  const labelsForPlatform = (platformId: string) =>
    allLabels.filter(l => l.platformId === platformId)

  const openLabelPicker = (accountId: string, platformId: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setOpenLabelGrid({ accountId, platformId, rect })
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Table2 size={18} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>Planilha Global</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Dados de todas as contas — duplo clique para editar</p>
        </div>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12 }}
          title={hideSensitive ? 'Mostrar dados sensíveis' : 'Ocultar dados sensíveis'}
          onClick={() => setHideSensitive(v => !v)}
        >
          {hideSensitive ? <Eye size={13} /> : <EyeOff size={13} />}
          {hideSensitive ? 'Mostrar dados' : 'Ocultar dados'}
        </button>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => { setLabelManagerPlatformId(filterPlatform === 'all' ? null : filterPlatform); setShowLabelManager(true) }}
        >
          <Pencil size={13} /> Gerenciar etiquetas
        </button>
      </div>

      {/* Platform filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          className={`btn ${filterPlatform === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: 12 }}
          onClick={() => setFilterPlatform('all')}
        >
          Todas ({accounts.length})
        </button>
        {platforms.map(p => (
          <button
            key={p.id}
            className={`btn ${filterPlatform === p.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setFilterPlatform(p.id)}
          >
            <PlatformIcon name={p.icon || 'default'} size={13} />
            {p.name} ({accounts.filter(a => a.platform.id === p.id).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma conta encontrada.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 1200 }}>
              <colgroup>
                <col style={{ width: 36 }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 140 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 40 }} />
              </colgroup>
              <thead>
                <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Plataforma', 'Nome da Conta', 'Login / Email', 'Senha', 'Telefone', 'Slot', 'Categoria', 'Fornecedor', 'Anotações', 'Progresso', ''].map((h, i) => (
                    <th key={i} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((acc, idx) => {
                  const vals = cellValues[acc.id] || {}
                  const pct = acc.totalDays ? Math.round((acc.completedDays / acc.totalDays) * 100) : 0
                  const platformLabels = labelsForPlatform(acc.platform.id)
                  const currentLabel = platformLabels.find(l => l.id === vals.categoryId) || acc.category
                  const wa = isWhatsApp(acc)

                  return (
                    <tr
                      key={acc.id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* # */}
                      <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{idx + 1}</td>

                      {/* Platform */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PlatformIcon name={acc.platform.icon || 'default'} size={14} />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.platform.name}</span>
                        </div>
                      </td>

                      {/* Nome */}
                      <InlineCell
                        value={vals.name}
                        editing={editingCell?.accountId === acc.id && editingCell.field === 'name'}
                        onEdit={() => setEditingCell({ accountId: acc.id, field: 'name' })}
                        onChange={v => updateCellVal(acc.id, 'name', v)}
                        onSave={() => saveField(acc.id, 'name', vals.name || null)}
                        onCancel={() => setEditingCell(null)}
                        placeholder="Nome"
                        sensitive
                        hidden={hideSensitive}
                      />

                      {/* Login */}
                      <InlineCell
                        value={vals.username}
                        editing={editingCell?.accountId === acc.id && editingCell.field === 'username'}
                        onEdit={() => !wa && setEditingCell({ accountId: acc.id, field: 'username' })}
                        onChange={v => updateCellVal(acc.id, 'username', v)}
                        onSave={() => saveField(acc.id, 'username', vals.username || null)}
                        onCancel={() => setEditingCell(null)}
                        placeholder={wa ? '—' : 'email@exemplo.com'}
                        disabled={wa}
                        sensitive
                        hidden={hideSensitive}
                      />

                      {/* Senha */}
                      <InlineCell
                        value={vals.password}
                        editing={editingCell?.accountId === acc.id && editingCell.field === 'password'}
                        onEdit={() => !wa && setEditingCell({ accountId: acc.id, field: 'password' })}
                        onChange={v => updateCellVal(acc.id, 'password', v)}
                        onSave={() => saveField(acc.id, 'password', vals.password || null)}
                        onCancel={() => setEditingCell(null)}
                        placeholder={wa ? '—' : 'Senha'}
                        disabled={wa}
                        sensitive
                        hidden={hideSensitive}
                      />

                      {/* Telefone */}
                      <InlineCell
                        value={vals.phone}
                        editing={editingCell?.accountId === acc.id && editingCell.field === 'phone'}
                        onEdit={() => setEditingCell({ accountId: acc.id, field: 'phone' })}
                        onChange={v => updateCellVal(acc.id, 'phone', v)}
                        onSave={() => saveField(acc.id, 'phone', vals.phone || null)}
                        onCancel={() => setEditingCell(null)}
                        placeholder="+55 11 99999-9999"
                      />

                      {/* Slot */}
                      <InlineCell
                        value={vals.slot}
                        editing={editingCell?.accountId === acc.id && editingCell.field === 'slot'}
                        onEdit={() => setEditingCell({ accountId: acc.id, field: 'slot' })}
                        onChange={v => updateCellVal(acc.id, 'slot', v)}
                        onSave={() => saveField(acc.id, 'slot', vals.slot ? Number(vals.slot) : null)}
                        onCancel={() => setEditingCell(null)}
                        type="number"
                        placeholder="—"
                      />

                      {/* Categoria / etiqueta — duplo clique abre mini-grid */}
                      <td style={{ padding: '8px 10px', position: 'relative' }}>
                        <div
                          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          title="Duplo clique para selecionar etiqueta"
                          onDoubleClick={e => openLabelPicker(acc.id, acc.platform.id, e)}
                        >
                          {currentLabel ? (
                            <span className="badge" style={{ background: currentLabel.color + '22', color: currentLabel.color, borderColor: currentLabel.color + '55', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              {currentLabel.name}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Tag size={10} /> —
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fornecedor */}
                      <InlineCell
                        value={vals.supplier}
                        editing={editingCell?.accountId === acc.id && editingCell.field === 'supplier'}
                        onEdit={() => setEditingCell({ accountId: acc.id, field: 'supplier' })}
                        onChange={v => updateCellVal(acc.id, 'supplier', v)}
                        onSave={() => saveField(acc.id, 'supplier', vals.supplier || null)}
                        onCancel={() => setEditingCell(null)}
                        placeholder="Fornecedor"
                      />

                      {/* Anotações */}
                      <InlineCell
                        value={vals.annotations}
                        editing={editingCell?.accountId === acc.id && editingCell.field === 'annotations'}
                        onEdit={() => setEditingCell({ accountId: acc.id, field: 'annotations' })}
                        onChange={v => updateCellVal(acc.id, 'annotations', v)}
                        onSave={() => saveField(acc.id, 'annotations', vals.annotations || null)}
                        onCancel={() => setEditingCell(null)}
                        placeholder="Anotações..."
                      />

                      {/* Progresso */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? '#22c55e' : 'var(--text-primary)', marginBottom: 2 }}>{pct}%</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#3b82f6' }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{acc.completedDays}/{acc.totalDays}d</div>
                      </td>

                      {/* Open account */}
                      <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '3px 5px' }}
                          title="Abrir conta"
                          onClick={() => router.push(`/account/${acc.id}`)}
                        >
                          <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TOTAL
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{filtered.length} conta{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Label grid popup */}
      {openLabelGrid && (
        <LabelGridPopup
          accountId={openLabelGrid.accountId}
          platformId={openLabelGrid.platformId}
          triggerRect={openLabelGrid.rect}
          labels={labelsForPlatform(openLabelGrid.platformId)}
          currentCategoryId={cellValues[openLabelGrid.accountId]?.categoryId ?? ''}
          onSelect={(labelId) => {
            updateCellVal(openLabelGrid.accountId, 'categoryId', labelId)
            saveField(openLabelGrid.accountId, 'categoryId', labelId)
            setOpenLabelGrid(null)
          }}
          onClear={() => {
            updateCellVal(openLabelGrid.accountId, 'categoryId', '')
            saveField(openLabelGrid.accountId, 'categoryId', null)
            setOpenLabelGrid(null)
          }}
          onManage={() => {
            setLabelManagerPlatformId(openLabelGrid.platformId)
            setShowLabelManager(true)
            setOpenLabelGrid(null)
          }}
          onClose={() => setOpenLabelGrid(null)}
        />
      )}

      {showLabelManager && (
        <LabelManagerModal
          platformId={labelManagerPlatformId}
          onClose={() => { setShowLabelManager(false); loadData() }}
        />
      )}
    </div>
  )
}

/* ---- LABEL GRID POPUP ---- */
function LabelGridPopup({
  accountId,
  platformId,
  triggerRect,
  labels,
  currentCategoryId,
  onSelect,
  onClear,
  onManage,
  onClose,
}: {
  accountId: string
  platformId: string
  triggerRect: DOMRect
  labels: Label[]
  currentCategoryId: string
  onSelect: (id: string) => void
  onClear: () => void
  onManage: () => void
  onClose: () => void
}) {
  const popupRef = useRef<HTMLDivElement>(null)

  const POPUP_W = 320
  const POPUP_H = 260

  const left = Math.min(triggerRect.left, window.innerWidth - POPUP_W - 8)
  const top = triggerRect.bottom + 6 + POPUP_H > window.innerHeight
    ? triggerRect.top - POPUP_H - 6
    : triggerRect.bottom + 6

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={onClose} />
      <div
        ref={popupRef}
        style={{
          position: 'fixed',
          top,
          left,
          width: POPUP_W,
          zIndex: 101,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
          padding: 14,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Selecionar etiqueta</p>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" style={{ padding: '2px 4px' }} onClick={onClose}><X size={13} /></button>
        </div>

        {labels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Nenhuma etiqueta nesta plataforma.</p>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={onManage}>
              <Plus size={12} /> Criar etiqueta
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10, maxHeight: 180, overflowY: 'auto' }}>
              {labels.map(l => (
                <div
                  key={l.id}
                  onClick={() => onSelect(l.id)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: currentCategoryId === l.id ? `2px solid ${l.color}` : '2px solid transparent',
                    background: l.color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'border-color 0.1s',
                  }}
                  title={l.name}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: l.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 72 }}>
                    {l.name}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" style={{ flex: 1, fontSize: 11 }} onClick={onClear}>
                <X size={11} /> Remover
              </button>
              <button className="btn btn-ghost" style={{ flex: 1, fontSize: 11 }} onClick={onManage}>
                <Pencil size={11} /> Gerenciar
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

/* Inline editable cell */
function InlineCell({
  value,
  editing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  type = 'text',
  placeholder,
  disabled,
  sensitive,
  hidden,
}: {
  value: string
  editing: boolean
  onEdit: () => void
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  type?: string
  placeholder?: string
  disabled?: boolean
  sensitive?: boolean
  hidden?: boolean
}) {
  if (editing) {
    return (
      <td style={{ padding: '4px 10px' }}>
        <input
          className="input"
          type={type}
          style={{ fontSize: 12, padding: '3px 6px', width: '100%' }}
          value={value}
          placeholder={placeholder}
          autoFocus
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onSave()
            if (e.key === 'Escape') onCancel()
          }}
          onBlur={onSave}
        />
      </td>
    )
  }

  const displayValue = sensitive && hidden && value ? '••••••••' : (value || '—')

  return (
    <td
      style={{
        padding: '8px 10px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 12,
        color: (!value || value === '') ? 'var(--text-muted)' : (sensitive && hidden ? 'var(--text-muted)' : 'var(--text-primary)'),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      onDoubleClick={disabled ? undefined : onEdit}
      title={disabled ? undefined : (sensitive && hidden ? '(oculto)' : (value || placeholder))}
    >
      {displayValue}
    </td>
  )
}

/* Label Manager Modal */
function LabelManagerModal({ platformId, onClose }: { platformId: string | null; onClose: () => void }) {
  const [labels, setLabels] = useState<Label[]>([])
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6b7280')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const load = () => {
    const url = platformId ? `/api/labels?platformId=${platformId}` : '/api/labels'
    fetch(url).then(r => r.json()).then(setLabels)
  }

  useEffect(() => { load() }, [platformId])

  const create = async () => {
    if (!newName.trim()) return
    await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, color: newColor, platformId: platformId || null }),
    })
    setNewName('')
    load()
  }

  const update = async (id: string) => {
    await fetch(`/api/labels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, color: editColor }),
    })
    setEditingId(null)
    load()
  }

  const remove = async (id: string) => {
    await fetch(`/api/labels/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>
            Gerenciar etiquetas{platformId ? '' : ' (global)'}
          </h2>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" style={{ padding: '4px 6px' }} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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
          <button className="btn btn-primary" style={{ padding: '6px 10px' }} onClick={create}>
            <Plus size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(c => (
            <div
              key={c}
              onClick={() => setNewColor(c)}
              style={{ width: 20, height: 20, borderRadius: 5, background: c, cursor: 'pointer', border: newColor === c ? '2px solid var(--text-primary)' : '2px solid transparent' }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {labels.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)' }}>
              {editingId === l.id ? (
                <>
                  <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4 }} />
                  <input className="input" value={editName} style={{ flex: 1, fontSize: 13 }} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && update(l.id)} autoFocus />
                  <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => update(l.id)}><Save size={12} /></button>
                  <button className="btn btn-ghost" style={{ padding: '4px 6px' }} onClick={() => setEditingId(null)}><X size={12} /></button>
                </>
              ) : (
                <>
                  <span className="badge" style={{ background: l.color + '22', color: l.color, borderColor: l.color + '55', fontWeight: 600, fontSize: 12 }}>{l.name}</span>
                  <div style={{ flex: 1 }} />
                  <button className="btn btn-ghost" style={{ padding: '3px 5px' }} onClick={() => { setEditingId(l.id); setEditName(l.name); setEditColor(l.color) }}><Pencil size={12} /></button>
                  <button className="btn btn-ghost" style={{ padding: '3px 5px', color: '#ef4444' }} onClick={() => remove(l.id)}><Trash2 size={12} /></button>
                </>
              )}
            </div>
          ))}
          {labels.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>Nenhuma etiqueta ainda.</p>
          )}
        </div>
      </div>
    </div>
  )
}
