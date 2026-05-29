'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Edit2,
  LayoutList,
  Table2,
  Plus,
  Check,
  Trash2,
  ChevronDown,
  ChevronRight,
  StickyNote,
  Save,
  MessageSquare,
  Pencil,
  X,
} from 'lucide-react'
import { STATUS_LABELS, formatDate } from '@/lib/utils'
import TOTPWidget from './TOTPWidget'
import StatusBadge from '@/components/ui/StatusBadge'
import PlatformIcon from '@/components/ui/PlatformIcon'

type Subtask = { id: string; title: string; completed: boolean; order: number }
type Task = { id: string; title: string; completed: boolean; notes: string | null; order: number; subtasks: Subtask[] }
type ScheduleDay = {
  id: string
  dayNumber: number
  title: string
  notes: string | null
  status: string
  order: number
  tasks: Task[]
}
type Label = { id: string; name: string; color: string }
type Account = {
  id: string
  name: string
  username: string | null
  password: string | null
  notes: string | null
  status: string
  totalDays: number
  totpSecret: string | null
  createdAt: string
  platform: { id: string; name: string; icon: string | null }
  category: Label | null
  categoryId: string | null
  slot: number | null
  phone: string | null
  stock: number | null
  supplier: string | null
  planPaymentDate: string | null
  annotations: string | null
  days: ScheduleDay[]
  accountNotes: { id: string; content: string; createdAt: string }[]
}

const STATUSES = ['not_started', 'warming', 'in_progress', 'paused', 'completed', 'problem']

export default function AccountDetailPage({ accountId }: { accountId: string }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [view, setView] = useState<'tasks' | 'sheet'>('tasks')
  const [editingAccount, setEditingAccount] = useState(false)
  const router = useRouter()

  const isWhatsApp = account?.platform?.icon?.toLowerCase() === 'whatsapp'

  const load = useCallback(() => {
    fetch(`/api/accounts/${accountId}`)
      .then((r) => r.json())
      .then(setAccount)
  }, [accountId])

  useEffect(() => { load() }, [load])

  if (!account) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Carregando...
      </div>
    )
  }

  const completedDays = account.days.filter((d) => d.status === 'completed').length
  const pct = account.totalDays ? Math.round((completedDays / account.totalDays) * 100) : 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button
          className="btn btn-ghost"
          style={{ padding: '4px 6px', marginTop: 2 }}
          onClick={() => router.push(`/platform/${account.platform.id}`)}
        >
          <ChevronLeft size={16} />
        </button>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'var(--surface-hover)',
            border: '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          {account.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>
              {account.name}
            </h1>
            <StatusBadge status={account.status} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <PlatformIcon name={account.platform.icon || 'default'} size={13} /> {account.platform.name}
            {account.username && ` · @${account.username}`}
            {' · '}Criado em {formatDate(account.createdAt)}
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => setEditingAccount(true)}>
          <Edit2 size={13} /> Editar
        </button>
      </div>

      {/* Progress bar — só para não-WhatsApp ou quando em tasks */}
      {(!isWhatsApp || view === 'tasks') && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Progresso do aquecimento</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? '#22c55e' : 'var(--text-primary)' }}>
                  {pct}%
                </span>
              </div>
              <div className="progress-bar" style={{ height: 6 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#3b82f6', height: '100%' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexShrink: 0, paddingLeft: 20, borderLeft: '1px solid var(--border)' }}>
              <Stat label="Concluídos" value={completedDays} color="#22c55e" />
              <Stat label="Restantes" value={account.totalDays - completedDays} color="#3b82f6" />
              <Stat label="Total" value={account.totalDays} color="var(--text-muted)" />
            </div>
          </div>
        </div>
      )}

      {/* View toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {account.totpSecret && <TOTPWidget secret={account.totpSecret} />}
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: 'flex',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 3,
            gap: 2,
          }}
        >
          <button
            className={`btn ${view === 'tasks' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '5px 12px', fontSize: 12 }}
            onClick={() => setView('tasks')}
          >
            <LayoutList size={13} /> Tarefas
          </button>
          <button
            className={`btn ${view === 'sheet' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '5px 12px', fontSize: 12 }}
            onClick={() => setView('sheet')}
          >
            <Table2 size={13} /> {isWhatsApp ? 'Dados da Conta' : 'Planilha'}
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'tasks' ? (
        <TasksView account={account} onUpdate={load} />
      ) : isWhatsApp ? (
        <WhatsAppSheet account={account} onUpdate={load} />
      ) : (
        <SheetView account={account} onUpdate={load} />
      )}

      {/* Account notes */}
      <AccountNotes accountId={account.id} notes={account.accountNotes} onUpdate={load} />

      {editingAccount && (
        <EditAccountModal
          account={account}
          onClose={() => setEditingAccount(false)}
          onSave={() => { setEditingAccount(false); load() }}
        />
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</p>
    </div>
  )
}

/* ---- WHATSAPP SHEET ---- */
function WhatsAppSheet({ account, onUpdate }: { account: Account; onUpdate: () => void }) {
  const [labels, setLabels] = useState<Label[]>([])
  const [showLabelManager, setShowLabelManager] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [values, setValues] = useState({
    slot: account.slot ?? '',
    phone: account.phone ?? '',
    categoryId: account.categoryId ?? '',
    stock: account.stock ?? '',
    supplier: account.supplier ?? '',
    planPaymentDate: account.planPaymentDate ?? '',
    annotations: account.annotations ?? '',
  })

  useEffect(() => {
    fetch('/api/labels').then(r => r.json()).then(setLabels)
  }, [showLabelManager])

  const save = async (field: string, value: string | number | null) => {
    await fetch(`/api/accounts/${account.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    onUpdate()
    setEditingField(null)
  }

  const currentLabel = labels.find(l => l.id === values.categoryId) || account.category

  const fields = [
    { key: 'slot', label: 'Nº Slot', type: 'number', value: values.slot },
    { key: 'phone', label: 'Número', type: 'text', value: values.phone },
    { key: 'category', label: 'Categoria', type: 'label', value: currentLabel },
    { key: 'stock', label: 'Qtd. em estoque', type: 'number', value: values.stock },
    { key: 'supplier', label: 'Fornecedor', type: 'text', value: values.supplier },
    { key: 'planPaymentDate', label: 'Data do pagamento do plano', type: 'date', value: values.planPaymentDate },
    { key: 'annotations', label: 'Anotações', type: 'text', value: values.annotations },
  ]

  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
      {/* Table header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 80px 1fr 120px 100px 120px 180px 1fr 40px',
          background: 'var(--background)',
          borderBottom: '1px solid var(--border)',
          padding: '0',
        }}
      >
        {['#', 'Nº Slot', 'Número', 'Categoria', 'Estoque', 'Fornecedor', 'Data do plano', 'Anotações', ''].map((h, i) => (
          <div key={i} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {h}
          </div>
        ))}
      </div>

      {/* Single data row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 80px 1fr 120px 100px 120px 180px 1fr 40px',
          borderBottom: '1px solid var(--border)',
          alignItems: 'center',
          minHeight: 48,
        }}
      >
        {/* Row number */}
        <div style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>1</div>

        {/* Slot */}
        <EditableCell
          value={values.slot !== '' ? String(values.slot) : '—'}
          editing={editingField === 'slot'}
          onEdit={() => setEditingField('slot')}
          onSave={(v) => { setValues(p => ({ ...p, slot: v })); save('slot', v ? Number(v) : null) }}
          onCancel={() => setEditingField(null)}
          type="number"
        />

        {/* Phone */}
        <EditableCell
          value={values.phone !== '' ? String(values.phone) : '—'}
          editing={editingField === 'phone'}
          onEdit={() => setEditingField('phone')}
          onSave={(v) => { setValues(p => ({ ...p, phone: v })); save('phone', v || null) }}
          onCancel={() => setEditingField(null)}
          placeholder="+55 11 99999-9999"
        />

        {/* Category label */}
        <div style={{ padding: '8px 10px' }}>
          <LabelCell
            label={currentLabel || null}
            labels={labels}
            onSelect={(id) => { setValues(p => ({ ...p, categoryId: id })); save('categoryId', id) }}
            onManage={() => setShowLabelManager(true)}
          />
        </div>

        {/* Stock */}
        <EditableCell
          value={values.stock !== '' ? String(values.stock) : '—'}
          editing={editingField === 'stock'}
          onEdit={() => setEditingField('stock')}
          onSave={(v) => { setValues(p => ({ ...p, stock: v })); save('stock', v ? Number(v) : null) }}
          onCancel={() => setEditingField(null)}
          type="number"
        />

        {/* Supplier */}
        <EditableCell
          value={values.supplier !== '' ? String(values.supplier) : '—'}
          editing={editingField === 'supplier'}
          onEdit={() => setEditingField('supplier')}
          onSave={(v) => { setValues(p => ({ ...p, supplier: v })); save('supplier', v || null) }}
          onCancel={() => setEditingField(null)}
          placeholder="Nome do fornecedor"
        />

        {/* Plan payment date */}
        <EditableCell
          value={values.planPaymentDate !== '' ? String(values.planPaymentDate) : '—'}
          editing={editingField === 'planPaymentDate'}
          onEdit={() => setEditingField('planPaymentDate')}
          onSave={(v) => { setValues(p => ({ ...p, planPaymentDate: v })); save('planPaymentDate', v || null) }}
          onCancel={() => setEditingField(null)}
          type="date"
        />

        {/* Annotations */}
        <EditableCell
          value={values.annotations !== '' ? String(values.annotations) : '—'}
          editing={editingField === 'annotations'}
          onEdit={() => setEditingField('annotations')}
          onSave={(v) => { setValues(p => ({ ...p, annotations: v })); save('annotations', v || null) }}
          onCancel={() => setEditingField(null)}
          placeholder="Anotações..."
        />

        {/* Edit button */}
        <div style={{ padding: '8px 6px', display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '3px 5px' }}
            onClick={() => setEditingField(editingField ? null : 'phone')}
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>

      {/* Footer sum */}
      <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          SOMA
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>1</span>
      </div>

      {/* Label manager modal */}
      {showLabelManager && (
        <LabelManagerModal onClose={() => setShowLabelManager(false)} />
      )}
    </div>
  )
}

/* Editable inline cell */
function EditableCell({
  value,
  editing,
  onEdit,
  onSave,
  onCancel,
  type = 'text',
  placeholder,
}: {
  value: string
  editing: boolean
  onEdit: () => void
  onSave: (v: string) => void
  onCancel: () => void
  type?: string
  placeholder?: string
}) {
  const [local, setLocal] = useState(value === '—' ? '' : value)

  useEffect(() => {
    setLocal(value === '—' ? '' : value)
  }, [value, editing])

  if (editing) {
    return (
      <div style={{ padding: '4px 10px' }}>
        <input
          className="input"
          type={type}
          style={{ fontSize: 13, padding: '4px 8px' }}
          value={local}
          placeholder={placeholder}
          autoFocus
          onChange={e => setLocal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onSave(local)
            if (e.key === 'Escape') onCancel()
          }}
          onBlur={() => onSave(local)}
        />
      </div>
    )
  }

  return (
    <div
      style={{ padding: '8px 10px', cursor: 'pointer', fontSize: 13, color: value === '—' ? 'var(--text-muted)' : 'var(--text-primary)' }}
      onDoubleClick={onEdit}
      title="Duplo clique para editar"
    >
      {value}
    </div>
  )
}

/* Label selector cell */
function LabelCell({
  label,
  labels,
  onSelect,
  onManage,
}: {
  label: Label | null
  labels: Label[]
  onSelect: (id: string) => void
  onManage: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        onClick={() => setOpen(!open)}
      >
        {label ? (
          <span
            className="badge"
            style={{
              background: label.color + '22',
              color: label.color,
              borderColor: label.color + '55',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {label.name}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— Selecionar</span>
        )}
      </div>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 50,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 180,
              padding: 6,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Selecione uma opção ou crie uma
            </p>
            {labels.map(l => (
              <div
                key={l.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => { onSelect(l.id); setOpen(false) }}
              >
                <span
                  className="badge"
                  style={{
                    background: l.color + '22',
                    color: l.color,
                    borderColor: l.color + '55',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {l.name}
                </span>
              </div>
            ))}
            <div className="divider" style={{ margin: '4px 0' }} />
            <div
              style={{ padding: '6px 8px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: 6 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onClick={() => { setOpen(false); onManage() }}
            >
              + Gerenciar etiquetas
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* Label manager modal */
function LabelManagerModal({ onClose }: { onClose: () => void }) {
  const [labels, setLabels] = useState<Label[]>([])
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6b7280')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6',
    '#8b5cf6', '#ec4899', '#6b7280', '#14b8a6', '#0ea5e9',
  ]

  const load = () => fetch('/api/labels').then(r => r.json()).then(setLabels)
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!newName.trim()) return
    await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, color: newColor }),
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
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Gerenciar etiquetas</h2>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" style={{ padding: '4px 6px' }} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Create new */}
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

        {/* Preset colors */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(c => (
            <div
              key={c}
              onClick={() => setNewColor(c)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                background: c,
                cursor: 'pointer',
                border: newColor === c ? '2px solid var(--text-primary)' : '2px solid transparent',
              }}
            />
          ))}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {labels.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)' }}>
              {editingId === l.id ? (
                <>
                  <input
                    type="color"
                    value={editColor}
                    onChange={e => setEditColor(e.target.value)}
                    style={{ width: 28, height: 28, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4 }}
                  />
                  <input
                    className="input"
                    value={editName}
                    style={{ flex: 1, fontSize: 13 }}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && update(l.id)}
                    autoFocus
                  />
                  <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => update(l.id)}>
                    <Save size={12} />
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '4px 6px' }} onClick={() => setEditingId(null)}>
                    <X size={12} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="badge"
                    style={{ background: l.color + '22', color: l.color, borderColor: l.color + '55', fontWeight: 600, fontSize: 12 }}
                  >
                    {l.name}
                  </span>
                  <div style={{ flex: 1 }} />
                  <button className="btn btn-ghost" style={{ padding: '3px 5px' }} onClick={() => { setEditingId(l.id); setEditName(l.name); setEditColor(l.color) }}>
                    <Pencil size={12} />
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '3px 5px', color: '#ef4444' }} onClick={() => remove(l.id)}>
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          ))}
          {labels.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>
              Nenhuma etiqueta ainda. Crie a primeira acima.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- TASKS VIEW ---- */
function TasksView({ account, onUpdate }: { account: Account; onUpdate: () => void }) {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [dayTitles, setDayTitles] = useState<Record<string, string>>({})
  const [newTaskInput, setNewTaskInput] = useState<Record<string, string>>({})

  const toggleDay = (id: string) =>
    setExpandedDays((prev) => ({ ...prev, [id]: !prev[id] }))

  const updateDayStatus = async (dayId: string, status: string) => {
    await fetch(`/api/days/${dayId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    onUpdate()
  }

  const saveDayTitle = async (dayId: string) => {
    const title = dayTitles[dayId]
    if (!title?.trim()) return
    await fetch(`/api/days/${dayId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setEditingDay(null)
    onUpdate()
  }

  const addTask = async (dayId: string) => {
    const title = newTaskInput[dayId]?.trim()
    if (!title) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayId, title }),
    })
    setNewTaskInput((prev) => ({ ...prev, [dayId]: '' }))
    onUpdate()
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    onUpdate()
  }

  const deleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    onUpdate()
  }

  const addSubtask = async (taskId: string, title: string) => {
    if (!title.trim()) return
    await fetch('/api/subtasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, title }),
    })
    onUpdate()
  }

  const toggleSubtask = async (subtaskId: string, completed: boolean) => {
    await fetch(`/api/subtasks/${subtaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    onUpdate()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {account.days.map((day) => {
        const isExpanded = expandedDays[day.id] ?? day.status !== 'completed'
        const tasksDone = day.tasks.filter((t) => t.completed).length
        const dayPct = day.tasks.length ? Math.round((tasksDone / day.tasks.length) * 100) : 0

        return (
          <div key={day.id} className="card" style={{ overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                cursor: 'pointer',
                background: day.status === 'completed' ? '#f0fdf4' : undefined,
              }}
              onClick={() => toggleDay(day.id)}
            >
              {isExpanded ? (
                <ChevronDown size={14} color="var(--text-muted)" />
              ) : (
                <ChevronRight size={14} color="var(--text-muted)" />
              )}

              {editingDay === day.id ? (
                <input
                  className="input"
                  style={{ flex: 1, padding: '3px 8px', fontSize: 13 }}
                  value={dayTitles[day.id] ?? day.title}
                  onChange={(e) =>
                    setDayTitles((prev) => ({ ...prev, [day.id]: e.target.value }))
                  }
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveDayTitle(day.id)
                    if (e.key === 'Escape') setEditingDay(null)
                  }}
                  autoFocus
                />
              ) : (
                <span
                  style={{ fontWeight: 600, fontSize: 14, flex: 1 }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setEditingDay(day.id)
                    setDayTitles((prev) => ({ ...prev, [day.id]: day.title }))
                  }}
                >
                  {day.title}
                </span>
              )}

              {day.tasks.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {tasksDone}/{day.tasks.length}
                </span>
              )}
              {day.tasks.length > 0 && (
                <div className="progress-bar" style={{ width: 48 }} onClick={(e) => e.stopPropagation()}>
                  <div
                    className="progress-fill"
                    style={{ width: `${dayPct}%`, background: dayPct === 100 ? '#22c55e' : '#3b82f6' }}
                  />
                </div>
              )}

              <div onClick={(e) => e.stopPropagation()}>
                <select
                  className="input"
                  style={{ padding: '3px 6px', fontSize: 11, width: 'auto' }}
                  value={day.status}
                  onChange={(e) => updateDayStatus(day.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {editingDay === day.id && (
                <button
                  className="btn btn-ghost"
                  style={{ padding: '3px 6px' }}
                  onClick={(e) => { e.stopPropagation(); saveDayTitle(day.id) }}
                >
                  <Save size={13} />
                </button>
              )}
            </div>

            {isExpanded && (
              <div style={{ padding: '8px 16px 14px', borderTop: '1px solid var(--border)' }}>
                {day.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onAddSubtask={addSubtask}
                    onToggleSubtask={toggleSubtask}
                  />
                ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <input
                    className="input"
                    style={{ flex: 1 }}
                    placeholder="Adicionar tarefa..."
                    value={newTaskInput[day.id] || ''}
                    onChange={(e) =>
                      setNewTaskInput((prev) => ({ ...prev, [day.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTask(day.id)
                    }}
                  />
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', flexShrink: 0 }}
                    onClick={() => addTask(day.id)}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
}: {
  task: Task
  onToggle: (id: string, v: boolean) => void
  onDelete: (id: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onToggleSubtask: (id: string, v: boolean) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [newSub, setNewSub] = useState('')
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)

  const saveTitle = async () => {
    if (!title.trim()) return
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setEditing(false)
  }

  const saveNotes = async () => {
    setSavingNotes(true)
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSavingNotes(false)
  }

  const subDone = task.subtasks.filter((s) => s.completed).length

  return (
    <div
      style={{
        marginBottom: 4,
        background: task.completed ? 'var(--surface-hover)' : 'transparent',
        borderRadius: 7,
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
        <div
          className={`checkbox ${task.completed ? 'checked' : ''}`}
          onClick={() => onToggle(task.id, !task.completed)}
        >
          {task.completed && <Check size={9} color="white" strokeWidth={3} />}
        </div>

        {editing ? (
          <input
            className="input"
            style={{ flex: 1, padding: '2px 6px', fontSize: 13 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle()
              if (e.key === 'Escape') setEditing(false)
            }}
            onBlur={saveTitle}
            autoFocus
          />
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: 13,
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: 'text',
            }}
            onDoubleClick={() => setEditing(true)}
          >
            {task.title}
          </span>
        )}

        {task.subtasks.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {subDone}/{task.subtasks.length}
          </span>
        )}

        <button
          className="btn btn-ghost"
          style={{ padding: '2px 5px', color: (task.notes || notes) ? '#f59e0b' : undefined }}
          title="Notas da tarefa"
          onClick={() => setShowNotes(!showNotes)}
        >
          <MessageSquare size={12} />
        </button>

        <button
          className="btn btn-ghost"
          style={{ padding: '2px 5px' }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        <button
          className="btn btn-ghost"
          style={{ padding: '2px 5px', color: '#ef4444' }}
          onClick={() => onDelete(task.id)}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {showNotes && (
        <div style={{ padding: '6px 10px 10px 34px', borderTop: '1px solid var(--border)', background: 'var(--surface-hover)' }}>
          <textarea
            className="input"
            style={{ fontSize: 12, minHeight: 56, resize: 'vertical', marginBottom: 6 }}
            placeholder="Notas desta tarefa..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            className="btn btn-secondary"
            style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={saveNotes}
            disabled={savingNotes}
          >
            <Save size={11} /> {savingNotes ? 'Salvando...' : 'Salvar nota'}
          </button>
        </div>
      )}

      {expanded && (
        <div style={{ padding: '4px 10px 10px 34px', borderTop: '1px solid var(--border)' }}>
          {task.subtasks.map((sub) => (
            <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
              <div
                className={`checkbox ${sub.completed ? 'checked' : ''}`}
                style={{ width: 13, height: 13 }}
                onClick={() => onToggleSubtask(sub.id, !sub.completed)}
              >
                {sub.completed && <Check size={8} color="white" strokeWidth={3} />}
              </div>
              <span
                style={{
                  fontSize: 12,
                  textDecoration: sub.completed ? 'line-through' : 'none',
                  color: sub.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                }}
              >
                {sub.title}
              </span>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <input
              className="input"
              style={{ flex: 1, fontSize: 12 }}
              placeholder="Nova subtarefa..."
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onAddSubtask(task.id, newSub); setNewSub('') }
              }}
            />
            <button
              className="btn btn-secondary"
              style={{ padding: '5px 8px' }}
              onClick={() => { onAddSubtask(task.id, newSub); setNewSub('') }}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- SHEET VIEW (non-WhatsApp) — planilha de dados da conta ---- */
function SheetView({ account, onUpdate }: { account: Account; onUpdate: () => void }) {
  const [labels, setLabels] = useState<Label[]>([])
  const [showLabelManager, setShowLabelManager] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [values, setValues] = useState({
    name: account.name,
    username: account.username ?? '',
    password: account.password ?? '',
    categoryId: account.categoryId ?? '',
    annotations: account.annotations ?? '',
  })

  useEffect(() => {
    fetch('/api/labels').then(r => r.json()).then(setLabels)
  }, [showLabelManager])

  const save = async (field: string, value: string | null) => {
    await fetch(`/api/accounts/${account.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    onUpdate()
    setEditingField(null)
  }

  const currentLabel = labels.find(l => l.id === values.categoryId) || account.category

  const completedDays = account.days.filter(d => d.status === 'completed').length
  const pct = account.totalDays ? Math.round((completedDays / account.totalDays) * 100) : 0

  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 1fr 1fr 140px 1fr 120px 40px',
          background: 'var(--background)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {['#', 'Nome da Conta', 'Login / Email', 'Senha', 'Categoria', 'Anotações', 'Progresso', ''].map((h, i) => (
          <div key={i} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {h}
          </div>
        ))}
      </div>

      {/* Data row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 1fr 1fr 140px 1fr 120px 40px',
          borderBottom: '1px solid var(--border)',
          alignItems: 'center',
          minHeight: 48,
        }}
      >
        <div style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>1</div>

        {/* Nome */}
        <EditableCell
          value={values.name || '—'}
          editing={editingField === 'name'}
          onEdit={() => setEditingField('name')}
          onSave={(v) => { setValues(p => ({ ...p, name: v })); save('name', v || null) }}
          onCancel={() => setEditingField(null)}
          placeholder="Nome da conta"
        />

        {/* Login */}
        <EditableCell
          value={values.username !== '' ? values.username : '—'}
          editing={editingField === 'username'}
          onEdit={() => setEditingField('username')}
          onSave={(v) => { setValues(p => ({ ...p, username: v })); save('username', v || null) }}
          onCancel={() => setEditingField(null)}
          placeholder="email@exemplo.com"
        />

        {/* Senha */}
        <EditableCell
          value={values.password !== '' ? values.password : '—'}
          editing={editingField === 'password'}
          onEdit={() => setEditingField('password')}
          onSave={(v) => { setValues(p => ({ ...p, password: v })); save('password', v || null) }}
          onCancel={() => setEditingField(null)}
          placeholder="Senha..."
        />

        {/* Categoria / etiqueta */}
        <div style={{ padding: '8px 10px' }}>
          <LabelCell
            label={currentLabel || null}
            labels={labels}
            onSelect={(id) => { setValues(p => ({ ...p, categoryId: id })); save('categoryId', id) }}
            onManage={() => setShowLabelManager(true)}
          />
        </div>

        {/* Anotações */}
        <EditableCell
          value={values.annotations !== '' ? values.annotations : '—'}
          editing={editingField === 'annotations'}
          onEdit={() => setEditingField('annotations')}
          onSave={(v) => { setValues(p => ({ ...p, annotations: v })); save('annotations', v || null) }}
          onCancel={() => setEditingField(null)}
          placeholder="Anotações..."
        />

        {/* Progresso */}
        <div style={{ padding: '8px 10px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? '#22c55e' : 'var(--text-primary)', marginBottom: 4 }}>{pct}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#3b82f6' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{completedDays}/{account.totalDays} dias</div>
        </div>

        {/* Edit button */}
        <div style={{ padding: '8px 6px', display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '3px 5px' }}
            onClick={() => setEditingField(editingField ? null : 'name')}
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>

      <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          SOMA
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>1</span>
      </div>

      {showLabelManager && (
        <LabelManagerModal onClose={() => setShowLabelManager(false)} />
      )}
    </div>
  )
}

/* ---- ACCOUNT NOTES ---- */
function AccountNotes({
  accountId,
  notes,
  onUpdate,
}: {
  accountId: string
  notes: { id: string; content: string; createdAt: string }[]
  onUpdate: () => void
}) {
  const [content, setContent] = useState('')
  const [show, setShow] = useState(false)

  const addNote = async () => {
    if (!content.trim()) return
    await fetch(`/api/notes/account/${accountId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setContent('')
    onUpdate()
  }

  return (
    <div style={{ marginTop: 20 }}>
      <button
        className="btn btn-ghost"
        style={{ gap: 6, fontSize: 13 }}
        onClick={() => setShow(!show)}
      >
        <StickyNote size={14} />
        Notas da conta ({notes.length})
        {show ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>

      {show && (
        <div className="card" style={{ marginTop: 8, padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <textarea
              className="input"
              style={{ flex: 1, minHeight: 60, resize: 'vertical' }}
              placeholder="Adicionar nota..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={addNote}>
              <Plus size={14} />
            </button>
          </div>

          {notes.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhuma nota ainda.</p>
          )}

          {notes.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '10px 12px',
                background: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: 8,
                marginBottom: 6,
              }}
            >
              <p style={{ fontSize: 13 }}>{n.content}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {formatDate(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- EDIT ACCOUNT MODAL ---- */
function EditAccountModal({
  account,
  onClose,
  onSave,
}: {
  account: Account
  onClose: () => void
  onSave: () => void
}) {
  const isWhatsApp = account.platform.icon?.toLowerCase() === 'whatsapp'
  const [name, setName] = useState(account.name)
  const [phone, setPhone] = useState(account.phone || '')
  const [email, setEmail] = useState(account.username || '')
  const [password, setPassword] = useState(account.password || '')
  const [status, setStatus] = useState(account.status)
  const [notes, setNotes] = useState(account.notes || '')
  const [totpSecret, setTotpSecret] = useState(account.totpSecret || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await fetch(`/api/accounts/${account.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        username: isWhatsApp ? null : email,
        password: isWhatsApp ? null : password,
        phone: isWhatsApp ? phone : null,
        status,
        notes,
        totpSecret: totpSecret || null,
      }),
    })
    setLoading(false)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Editar conta</h2>

        <div style={{ marginBottom: 14 }}>
          <label className="label">Nome da conta</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {isWhatsApp ? (
          <div style={{ marginBottom: 14 }}>
            <label className="label">Número de telefone</label>
            <input className="input" placeholder="+55 11 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label className="label">Email / Login</label>
              <input className="input" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {!isWhatsApp && (
          <div style={{ marginBottom: 14 }}>
            <label className="label">Chave TOTP (2FA)</label>
            <input className="input" placeholder="Chave secreta..." value={totpSecret} onChange={(e) => setTotpSecret(e.target.value)} />
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label className="label">Observações</label>
          <textarea className="input" style={{ minHeight: 80, resize: 'vertical' }} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
