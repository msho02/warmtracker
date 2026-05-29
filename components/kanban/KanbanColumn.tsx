'use client'

import { useState, useRef } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { KanbanColumnData, KanbanCardData } from './types'
import KanbanCard from './KanbanCard'
import KanbanCardModal from './KanbanCardModal'

type DragInfo = { cardId: string; fromColumnId: string }

type Props = {
  column: KanbanColumnData
  columns: KanbanColumnData[]
  filteredCardIds: Set<string>
  dragInfo: DragInfo | null
  onDragStart: (info: DragInfo) => void
  onDragEnd: () => void
  onDropCard: (toColumnId: string, afterCardId: string | null) => void
  onAddCard: (columnId: string, title: string) => Promise<void>
  onUpdateCard: (card: KanbanCardData) => void
  onDeleteCard: (cardId: string) => void
  onDuplicateCard: (cardId: string) => void
  onMoveCard: (cardId: string, toColumnId: string) => void
  onRenameColumn: (columnId: string, title: string) => Promise<void>
  onDeleteColumn: (columnId: string) => void
  toast: { success: (m: string) => void; error: (m: string) => void }
}

export default function KanbanColumn({
  column, columns, filteredCardIds, dragInfo,
  onDragStart, onDragEnd, onDropCard,
  onAddCard, onUpdateCard, onDeleteCard, onDuplicateCard, onMoveCard,
  onRenameColumn, onDeleteColumn, toast,
}: Props) {
  const [addingCard, setAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [savingCard, setSavingCard] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(column.title)
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDeleteCol, setConfirmDeleteCol] = useState(false)
  const [openCardId, setOpenCardId] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null)
  const dragCounter = useRef(0)

  const visibleCards = column.cards.filter((c) => filteredCardIds.has(c.id))
  const openCard = column.cards.find((c) => c.id === openCardId) ?? null

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return
    setSavingCard(true)
    try {
      await onAddCard(column.id, newCardTitle.trim())
      setNewCardTitle('')
      setAddingCard(false)
      toast.success('Cartão criado!')
    } catch {
      toast.error('Erro ao criar cartão.')
    } finally {
      setSavingCard(false)
    }
  }

  const handleRename = async () => {
    if (!renameValue.trim()) return
    setRenaming(false)
    await onRenameColumn(column.id, renameValue.trim())
    toast.success('Coluna renomeada!')
  }

  const handleDeleteCol = () => {
    setShowMenu(false)
    setConfirmDeleteCol(false)
    onDeleteColumn(column.id)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragOver(false)
    setDragOverCardId(null)
    onDropCard(column.id, dragOverCardId)
  }

  const handleCardDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCardId(cardId)
  }

  return (
    <>
      <div
        style={{
          width: 272,
          minWidth: 272,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
        }}
      >
        {/* Column header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 4px 8px',
          }}
        >
          {renaming ? (
            <form
              style={{ display: 'flex', gap: 4, flex: 1, alignItems: 'center' }}
              onSubmit={(e) => { e.preventDefault(); handleRename() }}
            >
              <input
                className="input"
                style={{ flex: 1, height: 28, fontSize: 12 }}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                onBlur={handleRename}
              />
              <button type="submit" className="btn btn-ghost" style={{ padding: 4 }}>
                <Check size={13} />
              </button>
              <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={() => { setRenaming(false); setRenameValue(column.title) }}>
                <X size={13} />
              </button>
            </form>
          ) : (
            <>
              <span
                style={{
                  flex: 1, fontSize: 13, fontWeight: 600,
                  color: 'var(--text-primary)', letterSpacing: '-0.01em',
                }}
              >
                {column.title}
              </span>
              <span
                style={{
                  fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
                  background: 'var(--surface-hover)', padding: '1px 7px',
                  borderRadius: 999, minWidth: 20, textAlign: 'center',
                }}
              >
                {column.cards.length}
              </span>

              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: 4, opacity: 0.6 }}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreHorizontal size={14} />
                </button>
                {showMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => { setShowMenu(false); setConfirmDeleteCol(false) }} />
                    <div
                      style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 4,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
                        minWidth: 160, zIndex: 10, overflow: 'hidden',
                      }}
                    >
                      <ColMenuBtn icon={<Pencil size={12} />} label="Renomear" onClick={() => { setShowMenu(false); setRenaming(true); setRenameValue(column.title) }} />
                      <ColMenuBtn icon={<Plus size={12} />} label="Adicionar cartão" onClick={() => { setShowMenu(false); setAddingCard(true) }} />
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      {confirmDeleteCol ? (
                        <div style={{ padding: '8px 12px' }}>
                          {column.cards.length > 0 ? (
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                              Esta coluna possui {column.cards.length} cartão(s). Mova-os antes de excluir.
                            </p>
                          ) : (
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                              Excluir a coluna &ldquo;{column.title}&rdquo;?
                            </p>
                          )}
                          {column.cards.length === 0 && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                style={{ flex: 1, padding: '4px 0', fontSize: 11, background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                onClick={handleDeleteCol}
                              >
                                Excluir
                              </button>
                              <button
                                style={{ flex: 1, padding: '4px 0', fontSize: 11, background: 'var(--surface-hover)', color: 'var(--text-primary)', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                onClick={() => setConfirmDeleteCol(false)}
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                          {column.cards.length > 0 && (
                            <button
                              style={{ width: '100%', padding: '4px 0', fontSize: 11, background: 'var(--surface-hover)', color: 'var(--text-primary)', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                              onClick={() => setConfirmDeleteCol(false)}
                            >
                              OK
                            </button>
                          )}
                        </div>
                      ) : (
                        <ColMenuBtn icon={<Trash2 size={12} />} label="Excluir coluna" onClick={() => setConfirmDeleteCol(true)} danger />
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Cards list */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minHeight: 60,
            padding: '4px 2px',
            borderRadius: 'var(--radius-lg)',
            background: isDragOver && dragInfo?.fromColumnId !== column.id
              ? 'var(--surface-hover)'
              : 'transparent',
            border: isDragOver ? '2px dashed var(--border-strong)' : '2px dashed transparent',
            transition: 'background 0.15s, border 0.15s',
          }}
        >
          {visibleCards.length === 0 && !isDragOver && (
            <div
              style={{
                padding: '20px 12px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 12,
              }}
            >
              Nenhum cartão
            </div>
          )}

          {visibleCards.map((card) => (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('cardId', card.id)
                onDragStart({ cardId: card.id, fromColumnId: column.id })
              }}
              onDragEnd={onDragEnd}
              onDragOver={(e) => handleCardDragOver(e, card.id)}
              style={{
                borderTop: dragOverCardId === card.id && dragInfo !== null ? '2px solid var(--accent-blue)' : '2px solid transparent',
                transition: 'border-color 0.1s',
              }}
            >
              <KanbanCard
                card={card}
                columns={columns}
                isDragging={dragInfo?.cardId === card.id}
                onOpen={() => setOpenCardId(card.id)}
                onDelete={(id) => { onDeleteCard(id); toast.success('Cartão excluído!') }}
                onDuplicate={onDuplicateCard}
                onMoveToColumn={onMoveCard}
              />
            </div>
          ))}
        </div>

        {/* Add card */}
        {addingCard ? (
          <div style={{ marginTop: 6 }}>
            <textarea
              className="input"
              style={{ fontSize: 12, resize: 'none', height: 72 }}
              placeholder="Título do cartão..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard() }
                if (e.key === 'Escape') { setAddingCard(false); setNewCardTitle('') }
              }}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, height: 32, fontSize: 12 }}
                onClick={handleAddCard}
                disabled={savingCard || !newCardTitle.trim()}
              >
                {savingCard ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                Adicionar
              </button>
              <button
                className="btn btn-ghost"
                style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                onClick={() => { setAddingCard(false); setNewCardTitle('') }}
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-ghost"
            style={{ marginTop: 6, width: '100%', justifyContent: 'flex-start', fontSize: 12, gap: 6, color: 'var(--text-muted)' }}
            onClick={() => setAddingCard(true)}
          >
            <Plus size={13} /> Adicionar cartão
          </button>
        )}
      </div>

      {/* Card modal */}
      {openCard && (
        <KanbanCardModal
          card={openCard}
          columns={columns}
          onClose={() => setOpenCardId(null)}
          onUpdate={(updated) => { onUpdateCard(updated); setOpenCardId(null) }}
          onDelete={(id) => { onDeleteCard(id); setOpenCardId(null); toast.success('Cartão excluído!') }}
          onMove={(cardId, colId) => { onMoveCard(cardId, colId); setOpenCardId(null) }}
        />
      )}
    </>
  )
}

function ColMenuBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
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
