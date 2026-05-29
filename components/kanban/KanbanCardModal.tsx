'use client'

import { useState, useCallback } from 'react'
import {
  X, Plus, Trash2, Check, Tag, ChevronDown,
  User, Phone, Hash, FileText, AlignLeft, BookOpen,
  Calendar, Loader2,
} from 'lucide-react'
import {
  KanbanCardData, KanbanColumnData, PLATFORMS, PRIORITIES,
  TAG_COLORS, CHECKLIST_TEMPLATES, Tag as TagType,
} from './types'
import PlatformBadge from './PlatformBadge'
import PriorityBadge from './PriorityBadge'

type Props = {
  card: KanbanCardData
  columns: KanbanColumnData[]
  onClose: () => void
  onUpdate: (card: KanbanCardData) => void
  onDelete: (cardId: string) => void
  onMove: (cardId: string, columnId: string) => void
}

export default function KanbanCardModal({ card, columns, onClose, onUpdate, onDelete, onMove }: Props) {
  const [data, setData] = useState({ ...card })
  const [tags, setTags] = useState<TagType[]>(() => {
    try { return JSON.parse(card.tags) } catch { return [] }
  })
  const [saving, setSaving] = useState(false)
  const [newCheckText, setNewCheckText] = useState('')
  const [addingCheck, setAddingCheck] = useState(false)
  const [editingCheckId, setEditingCheckId] = useState<string | null>(null)
  const [editingCheckText, setEditingCheckText] = useState('')
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [newTagLabel, setNewTagLabel] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loadingTemplate, setLoadingTemplate] = useState(false)

  const checklistDone = data.checklistItems.filter((i) => i.completed).length
  const checklistTotal = data.checklistItems.length
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0

  const set = (key: string, value: unknown) => setData((prev) => ({ ...prev, [key]: value }))

  const save = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/kanban/cards/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tags }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      updated.tags = updated.tags || '[]'
      onUpdate(updated)
    } finally {
      setSaving(false)
    }
  }, [data, tags, onUpdate])

  const handleDelete = async () => {
    await fetch(`/api/kanban/cards/${data.id}`, { method: 'DELETE' })
    onDelete(data.id)
    onClose()
  }

  const handleMove = async (columnId: string) => {
    setShowMoveMenu(false)
    await fetch(`/api/kanban/cards/${data.id}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, position: 0 }),
    })
    onMove(data.id, columnId)
    onClose()
  }

  const addChecklist = async () => {
    if (!newCheckText.trim()) return
    setAddingCheck(true)
    try {
      const res = await fetch(`/api/kanban/cards/${data.id}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newCheckText.trim(), position: data.checklistItems.length }),
      })
      const item = await res.json()
      setData((prev) => ({ ...prev, checklistItems: [...prev.checklistItems, item] }))
      setNewCheckText('')
    } finally {
      setAddingCheck(false)
    }
  }

  const toggleCheck = async (id: string, completed: boolean) => {
    await fetch(`/api/kanban/checklist/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    setData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.map((i) => (i.id === id ? { ...i, completed } : i)),
    }))
  }

  const saveCheckEdit = async (id: string) => {
    if (!editingCheckText.trim()) return
    await fetch(`/api/kanban/checklist/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editingCheckText.trim() }),
    })
    setData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.map((i) =>
        i.id === id ? { ...i, text: editingCheckText.trim() } : i
      ),
    }))
    setEditingCheckId(null)
  }

  const deleteCheck = async (id: string) => {
    await fetch(`/api/kanban/checklist/${id}`, { method: 'DELETE' })
    setData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((i) => i.id !== id),
    }))
  }

  const applyTemplate = async () => {
    if (!data.platform) return
    const items = CHECKLIST_TEMPLATES[data.platform]
    if (!items) return
    setLoadingTemplate(true)
    try {
      const created: import('./types').ChecklistItem[] = []
      for (let i = 0; i < items.length; i++) {
        const res = await fetch(`/api/kanban/cards/${data.id}/checklist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: items[i], position: data.checklistItems.length + i }),
        })
        created.push(await res.json())
      }
      setData((prev) => ({ ...prev, checklistItems: [...prev.checklistItems, ...created] }))
    } finally {
      setLoadingTemplate(false)
    }
  }

  const addTag = () => {
    if (!newTagLabel.trim()) return
    setTags((prev) => [...prev, { label: newTagLabel.trim(), bg: newTagColor.bg, color: newTagColor.color }])
    setNewTagLabel('')
    setShowTagPicker(false)
  }

  const removeTag = (i: number) => setTags((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 680, padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <input
              className="input"
              value={data.title}
              onChange={(e) => set('title', e.target.value)}
              style={{
                fontSize: 16,
                fontWeight: 600,
                border: 'none',
                padding: '0',
                background: 'transparent',
                letterSpacing: '-0.01em',
              }}
              placeholder="Título do cartão"
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {data.platform && <PlatformBadge platform={data.platform} size="md" />}
              <PriorityBadge priority={data.priority} size="md" />
              {tags.map((t, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 9px', borderRadius: 999, fontSize: 11,
                    fontWeight: 500, background: t.bg, color: t.color,
                    border: `1px solid ${t.color}22`,
                  }}
                >
                  {t.label}
                  <button
                    onClick={() => removeTag(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.color, padding: 0, lineHeight: 1, display: 'flex' }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button
                className="btn btn-ghost"
                style={{ padding: '2px 7px', fontSize: 11, height: 'auto', gap: 3 }}
                onClick={() => setShowTagPicker(!showTagPicker)}
              >
                <Tag size={10} /> Tag
              </button>
            </div>
            {showTagPicker && (
              <div
                style={{
                  marginTop: 8, padding: 12, background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c.bg}
                      onClick={() => setNewTagColor(c)}
                      style={{
                        width: 20, height: 20, borderRadius: 4, background: c.bg,
                        border: newTagColor.bg === c.bg ? `2px solid ${c.color}` : `1px solid ${c.color}44`,
                        cursor: 'pointer',
                      }}
                      title={c.label}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    className="input"
                    placeholder="Nome da tag"
                    value={newTagLabel}
                    onChange={(e) => setNewTagLabel(e.target.value)}
                    style={{ height: 30, fontSize: 12 }}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button className="btn btn-primary" style={{ height: 30, padding: '0 10px', fontSize: 12 }} onClick={addTag}>
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="btn btn-ghost" style={{ padding: 6, flexShrink: 0 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: 'calc(90vh - 130px)', overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Plataforma e Prioridade */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Plataforma</label>
                  <select
                    className="input"
                    value={data.platform || ''}
                    onChange={(e) => set('platform', e.target.value || null)}
                    style={{ height: 34, fontSize: 12 }}
                  >
                    <option value="">Nenhuma</option>
                    {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Prioridade</label>
                  <select
                    className="input"
                    value={data.priority}
                    onChange={(e) => set('priority', e.target.value)}
                    style={{ height: 34, fontSize: 12 }}
                  >
                    {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Dados da conta */}
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={11} /> Nome da conta
                </label>
                <input className="input" style={{ height: 34, fontSize: 12 }} value={data.accountName || ''} onChange={(e) => set('accountName', e.target.value || null)} placeholder="Ex: Conta pessoal" />
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Hash size={11} /> Usuário / @
                </label>
                <input className="input" style={{ height: 34, fontSize: 12 }} value={data.username || ''} onChange={(e) => set('username', e.target.value || null)} placeholder="@usuario" />
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> Telefone / Identificador
                </label>
                <input className="input" style={{ height: 34, fontSize: 12 }} value={data.phoneOrIdentifier || ''} onChange={(e) => set('phoneOrIdentifier', e.target.value || null)} placeholder="+55 11 99999-9999" />
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={11} /> Nicho
                </label>
                <input className="input" style={{ height: 34, fontSize: 12 }} value={data.niche || ''} onChange={(e) => set('niche', e.target.value || null)} placeholder="Ex: Marketing digital" />
              </div>

              {/* Datas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} /> Início aquecimento
                  </label>
                  <input type="date" className="input" style={{ height: 34, fontSize: 12 }} value={data.warmupStartDate || ''} onChange={(e) => set('warmupStartDate', e.target.value || null)} />
                </div>
                <div>
                  <label className="label">Fim aquecimento</label>
                  <input type="date" className="input" style={{ height: 34, fontSize: 12 }} value={data.warmupEndDate || ''} onChange={(e) => set('warmupEndDate', e.target.value || null)} />
                </div>
              </div>
              <div>
                <label className="label">Data limite</label>
                <input type="date" className="input" style={{ height: 34, fontSize: 12 }} value={data.dueDate || ''} onChange={(e) => set('dueDate', e.target.value || null)} />
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlignLeft size={11} /> Descrição
                </label>
                <textarea
                  className="input"
                  style={{ height: 90, resize: 'vertical', fontSize: 12 }}
                  value={data.description || ''}
                  onChange={(e) => set('description', e.target.value || null)}
                  placeholder="Descreva o objetivo deste aquecimento..."
                />
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FileText size={11} /> Observações
                </label>
                <textarea
                  className="input"
                  style={{ height: 90, resize: 'vertical', fontSize: 12 }}
                  value={data.notes || ''}
                  onChange={(e) => set('notes', e.target.value || null)}
                  placeholder="Anotações internas, alertas, etc..."
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={14} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Checklist</span>
                {checklistTotal > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {checklistDone}/{checklistTotal}
                  </span>
                )}
              </div>
              {data.platform && CHECKLIST_TEMPLATES[data.platform] && (
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 11, padding: '3px 9px', height: 'auto' }}
                  onClick={applyTemplate}
                  disabled={loadingTemplate}
                >
                  {loadingTemplate ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  Template {data.platform}
                </button>
              )}
            </div>

            {checklistTotal > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${checklistPct}%`, background: checklistPct === 100 ? '#16a34a' : 'var(--accent)' }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {checklistPct}%
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.checklistItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 6px', borderRadius: 'var(--radius)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div
                    className={`checkbox ${item.completed ? 'checked' : ''}`}
                    onClick={() => toggleCheck(item.id, !item.completed)}
                  >
                    {item.completed && <Check size={9} color="white" strokeWidth={3} />}
                  </div>
                  {editingCheckId === item.id ? (
                    <input
                      className="input"
                      style={{ flex: 1, height: 26, fontSize: 12 }}
                      value={editingCheckText}
                      onChange={(e) => setEditingCheckText(e.target.value)}
                      onBlur={() => saveCheckEdit(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveCheckEdit(item.id)
                        if (e.key === 'Escape') setEditingCheckId(null)
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      style={{
                        flex: 1, fontSize: 13, cursor: 'text',
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}
                      onDoubleClick={() => { setEditingCheckId(item.id); setEditingCheckText(item.text) }}
                    >
                      {item.text}
                    </span>
                  )}
                  <button
                    className="btn btn-ghost"
                    style={{ padding: 4, opacity: 0.5 }}
                    onClick={() => deleteCheck(item.id)}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input
                className="input"
                style={{ flex: 1, height: 32, fontSize: 12 }}
                placeholder="Adicionar item..."
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChecklist()}
              />
              <button
                className="btn btn-secondary"
                style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                onClick={addChecklist}
                disabled={addingCheck || !newCheckText.trim()}
              >
                {addingCheck ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {/* Move */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary"
                style={{ height: 32, fontSize: 12, gap: 4 }}
                onClick={() => setShowMoveMenu(!showMoveMenu)}
              >
                Mover <ChevronDown size={12} />
              </button>
              {showMoveMenu && (
                <div
                  style={{
                    position: 'absolute', bottom: '100%', left: 0, marginBottom: 4,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
                    minWidth: 160, zIndex: 10, overflow: 'hidden',
                  }}
                >
                  {columns.filter((c) => c.id !== data.columnId).map((c) => (
                    <button
                      key={c.id}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 12px', fontSize: 12, background: 'none',
                        border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      onClick={() => handleMove(c.id)}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {confirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Confirmar exclusão?</span>
                <button className="btn" style={{ height: 32, fontSize: 11, background: '#dc2626', color: 'white', border: 'none' }} onClick={handleDelete}>Excluir</button>
                <button className="btn btn-ghost" style={{ height: 32, fontSize: 11 }} onClick={() => setConfirmDelete(false)}>Cancelar</button>
              </div>
            ) : (
              <button
                className="btn btn-ghost"
                style={{ height: 32, fontSize: 12, color: '#dc2626', gap: 4 }}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={12} /> Excluir
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" style={{ height: 32, fontSize: 12 }} onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" style={{ height: 32, fontSize: 12, gap: 4 }} onClick={save} disabled={saving}>
              {saving ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />}
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
