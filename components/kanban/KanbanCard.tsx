'use client'

import { useState } from 'react'
import { GripVertical, MoreHorizontal, Pencil, Trash2, Copy, CheckSquare, Tag as TagIcon } from 'lucide-react'
import { KanbanCardData, KanbanColumnData, Tag } from './types'
import PlatformBadge from './PlatformBadge'
import PriorityBadge from './PriorityBadge'

type Props = {
  card: KanbanCardData
  columns: KanbanColumnData[]
  isDragging?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  onOpen: () => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMoveToColumn: (cardId: string, columnId: string) => void
}

export default function KanbanCard({
  card, columns, isDragging, dragHandleProps,
  onOpen, onDelete, onDuplicate, onMoveToColumn,
}: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const tags: Tag[] = (() => { try { return JSON.parse(card.tags) } catch { return [] } })()
  const checkDone = card.checklistItems.filter((i) => i.completed).length
  const checkTotal = card.checklistItems.length
  const checkPct = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0

  const closeMenu = () => { setShowMenu(false); setConfirmDelete(false) }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '10px 12px',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: isDragging ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        opacity: isDragging ? 0.85 : 1,
        transform: isDragging ? 'rotate(1.5deg) scale(1.02)' : 'none',
        transition: isDragging ? 'none' : 'box-shadow 0.15s, transform 0.15s',
        userSelect: 'none',
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-no-open]')) return
        onOpen()
      }}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        data-no-open
        style={{
          position: 'absolute',
          left: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--border-strong)',
          cursor: 'grab',
          padding: '4px 2px',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--border-strong)')}
      >
        <GripVertical size={13} />
      </div>

      {/* Actions menu */}
      <div data-no-open style={{ position: 'absolute', top: 8, right: 8 }}>
        <button
          className="btn btn-ghost"
          style={{ padding: 4, opacity: 0.6 }}
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
        >
          <MoreHorizontal size={14} />
        </button>
        {showMenu && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={closeMenu} />
            <div
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
                minWidth: 160, zIndex: 10, overflow: 'hidden',
              }}
            >
              <MenuBtn icon={<Pencil size={12} />} label="Editar" onClick={() => { closeMenu(); onOpen() }} />
              <MenuBtn icon={<Copy size={12} />} label="Duplicar" onClick={() => { closeMenu(); onDuplicate(card.id) }} />
              {columns.filter((c) => c.id !== card.columnId).length > 0 && (
                <div>
                  <div style={{ padding: '4px 12px 2px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Mover para
                  </div>
                  {columns.filter((c) => c.id !== card.columnId).map((col) => (
                    <MenuBtn
                      key={col.id}
                      icon={<TagIcon size={12} />}
                      label={col.title}
                      onClick={() => { closeMenu(); onMoveToColumn(card.id, col.id) }}
                    />
                  ))}
                </div>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              {confirmDelete ? (
                <div style={{ padding: '8px 12px' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Excluir este cartão? Não pode ser desfeito.
                  </p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      style={{ flex: 1, padding: '4px 0', fontSize: 11, background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); closeMenu(); onDelete(card.id) }}
                    >
                      Confirmar
                    </button>
                    <button
                      style={{ flex: 1, padding: '4px 0', fontSize: 11, background: 'var(--surface-hover)', color: 'var(--text-primary)', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <MenuBtn
                  icon={<Trash2 size={12} />}
                  label="Excluir"
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
                  danger
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ paddingLeft: 14, paddingRight: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: 'var(--text-primary)', marginBottom: 6 }}>
          {card.title}
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: tags.length > 0 || checkTotal > 0 ? 6 : 0 }}>
          {card.platform && <PlatformBadge platform={card.platform} />}
          <PriorityBadge priority={card.priority} />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: checkTotal > 0 ? 6 : 0 }}>
            {tags.map((t, i) => (
              <span
                key={i}
                style={{
                  padding: '1px 7px', borderRadius: 999, fontSize: 10, fontWeight: 500,
                  background: t.bg, color: t.color, border: `1px solid ${t.color}22`,
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}

        {/* Account info */}
        {(card.accountName || card.username) && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            {card.accountName}{card.username ? ` · ${card.username}` : ''}
          </p>
        )}

        {/* Checklist progress */}
        {checkTotal > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <CheckSquare size={11} style={{ color: checkPct === 100 ? '#16a34a' : 'var(--text-muted)', flexShrink: 0 }} />
            <div className="progress-bar" style={{ flex: 1, height: 3 }}>
              <div
                className="progress-fill"
                style={{ width: `${checkPct}%`, background: checkPct === 100 ? '#16a34a' : 'var(--accent)' }}
              />
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {checkDone}/{checkTotal}
            </span>
          </div>
        )}

        {/* Due date */}
        {card.dueDate && (
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5 }}>
            ⏰ {new Date(card.dueDate).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  )
}

function MenuBtn({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: (e: React.MouseEvent) => void
  danger?: boolean
}) {
  return (
    <button
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '7px 12px', fontSize: 12, background: 'none', border: 'none',
        cursor: 'pointer', color: danger ? '#dc2626' : 'var(--text-primary)',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  )
}
