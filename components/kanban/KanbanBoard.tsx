'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Loader2, LayoutGrid, Flame } from 'lucide-react'
import { KanbanBoardData, KanbanCardData, KanbanColumnData, Tag } from './types'
import KanbanColumn from './KanbanColumn'
import KanbanFilters, { FilterState } from './KanbanFilters'
import { ToastContainer, useToast } from '@/components/ui/Toast'

type DragInfo = { cardId: string; fromColumnId: string }

export default function KanbanBoard() {
  const [board, setBoard] = useState<KanbanBoardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingBoard, setCreatingBoard] = useState(false)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')
  const [savingCol, setSavingCol] = useState(false)
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null)
  const [filters, setFilters] = useState<FilterState>({ search: '', platform: '', priority: '', tag: '' })
  const toast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/kanban/boards')
      const boards: KanbanBoardData[] = await res.json()
      if (boards.length > 0) {
        setBoard(boards[0])
      } else {
        setBoard(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createBoard = async () => {
    setCreatingBoard(true)
    try {
      const res = await fetch('/api/kanban/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Aquecimento de Contas' }),
      })
      const b = await res.json()
      setBoard(b)
      toast.success('Quadro criado!')
    } catch {
      toast.error('Erro ao criar quadro.')
    } finally {
      setCreatingBoard(false)
    }
  }

  const addColumn = async () => {
    if (!newColTitle.trim() || !board) return
    setSavingCol(true)
    try {
      const res = await fetch(`/api/kanban/boards/${board.id}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newColTitle.trim(), position: board.columns.length }),
      })
      const col = await res.json()
      setBoard((prev) => prev ? { ...prev, columns: [...prev.columns, col] } : prev)
      setNewColTitle('')
      setAddingColumn(false)
      toast.success('Coluna criada!')
    } catch {
      toast.error('Erro ao criar coluna.')
    } finally {
      setSavingCol(false)
    }
  }

  const renameColumn = async (columnId: string, title: string) => {
    await fetch(`/api/kanban/columns/${columnId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setBoard((prev) =>
      prev
        ? { ...prev, columns: prev.columns.map((c) => (c.id === columnId ? { ...c, title } : c)) }
        : prev
    )
  }

  const deleteColumn = async (columnId: string) => {
    const res = await fetch(`/api/kanban/columns/${columnId}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || 'Erro ao excluir coluna.')
      return
    }
    setBoard((prev) =>
      prev ? { ...prev, columns: prev.columns.filter((c) => c.id !== columnId) } : prev
    )
    toast.success('Coluna excluída!')
  }

  const addCard = async (columnId: string, title: string) => {
    if (!board) return
    const col = board.columns.find((c) => c.id === columnId)
    const position = col ? col.cards.length : 0
    const res = await fetch('/api/kanban/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, title, position }),
    })
    const card = await res.json()
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((c) =>
              c.id === columnId ? { ...c, cards: [...c.cards, card] } : c
            ),
          }
        : prev
    )
  }

  const updateCard = (updated: KanbanCardData) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((col) => ({
              ...col,
              cards: col.cards.map((c) => (c.id === updated.id ? updated : c)),
            })),
          }
        : prev
    )
  }

  const deleteCard = async (cardId: string) => {
    await fetch(`/api/kanban/cards/${cardId}`, { method: 'DELETE' })
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((col) => ({
              ...col,
              cards: col.cards.filter((c) => c.id !== cardId),
            })),
          }
        : prev
    )
  }

  const duplicateCard = async (cardId: string) => {
    if (!board) return
    let sourceCard: KanbanCardData | null = null
    let sourceCol: KanbanColumnData | null = null
    for (const col of board.columns) {
      const found = col.cards.find((c) => c.id === cardId)
      if (found) { sourceCard = found; sourceCol = col; break }
    }
    if (!sourceCard || !sourceCol) return

    const res = await fetch('/api/kanban/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: sourceCard.columnId,
        title: `${sourceCard.title} (cópia)`,
        description: sourceCard.description,
        platform: sourceCard.platform,
        priority: sourceCard.priority,
        accountName: sourceCard.accountName,
        username: sourceCard.username,
        phoneOrIdentifier: sourceCard.phoneOrIdentifier,
        niche: sourceCard.niche,
        notes: sourceCard.notes,
        tags: JSON.parse(sourceCard.tags || '[]'),
        dueDate: sourceCard.dueDate,
        warmupStartDate: sourceCard.warmupStartDate,
        warmupEndDate: sourceCard.warmupEndDate,
        position: sourceCol.cards.length,
      }),
    })
    const newCard = await res.json()
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((col) =>
              col.id === sourceCard!.columnId
                ? { ...col, cards: [...col.cards, newCard] }
                : col
            ),
          }
        : prev
    )
    toast.success('Cartão duplicado!')
  }

  const moveCard = async (cardId: string, toColumnId: string) => {
    if (!board) return
    let card: KanbanCardData | null = null
    for (const col of board.columns) {
      const found = col.cards.find((c) => c.id === cardId)
      if (found) { card = found; break }
    }
    if (!card) return

    const toCol = board.columns.find((c) => c.id === toColumnId)
    const position = toCol ? toCol.cards.length : 0
    await fetch(`/api/kanban/cards/${cardId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId: toColumnId, position }),
    })
    setBoard((prev) => {
      if (!prev || !card) return prev
      return {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === card!.columnId) return { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          if (col.id === toColumnId) return { ...col, cards: [...col.cards, { ...card!, columnId: toColumnId }] }
          return col
        }),
      }
    })
    toast.success('Cartão movido!')
  }

  const handleDrop = async (toColumnId: string, afterCardId: string | null) => {
    if (!dragInfo || !board) return
    const { cardId, fromColumnId } = dragInfo
    setDragInfo(null)

    let card: KanbanCardData | null = null
    for (const col of board.columns) {
      const found = col.cards.find((c) => c.id === cardId)
      if (found) { card = found; break }
    }
    if (!card) return

    const toCol = board.columns.find((c) => c.id === toColumnId)
    if (!toCol) return

    let newPosition = 0
    if (afterCardId) {
      const idx = toCol.cards.findIndex((c) => c.id === afterCardId)
      newPosition = idx >= 0 ? idx : toCol.cards.length
    } else {
      newPosition = toCol.cards.length
    }

    await fetch(`/api/kanban/cards/${cardId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId: toColumnId, position: newPosition }),
    })

    setBoard((prev) => {
      if (!prev || !card) return prev
      const updatedCard = { ...card, columnId: toColumnId, position: newPosition }

      return {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === fromColumnId && fromColumnId !== toColumnId) {
            return { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          }
          if (col.id === toColumnId) {
            const withoutCard = col.cards.filter((c) => c.id !== cardId)
            const insertAt = afterCardId
              ? withoutCard.findIndex((c) => c.id === afterCardId)
              : withoutCard.length
            const newCards = [...withoutCard]
            newCards.splice(insertAt >= 0 ? insertAt : newCards.length, 0, updatedCard)
            return { ...col, cards: newCards.map((c, i) => ({ ...c, position: i })) }
          }
          return col
        }),
      }
    })
  }

  // Collect all unique tags across all cards
  const allTags = useMemo(() => {
    if (!board) return []
    const tagSet = new Set<string>()
    for (const col of board.columns) {
      for (const card of col.cards) {
        try {
          const tags: Tag[] = JSON.parse(card.tags || '[]')
          tags.forEach((t) => tagSet.add(t.label))
        } catch { /* skip */ }
      }
    }
    return Array.from(tagSet)
  }, [board])

  // Filter logic
  const filteredCardIds = useMemo(() => {
    if (!board) return new Set<string>()
    const ids = new Set<string>()
    const { search, platform, priority, tag } = filters
    for (const col of board.columns) {
      for (const card of col.cards) {
        const matchSearch = !search ||
          card.title.toLowerCase().includes(search.toLowerCase()) ||
          (card.accountName || '').toLowerCase().includes(search.toLowerCase()) ||
          (card.username || '').toLowerCase().includes(search.toLowerCase())
        const matchPlatform = !platform || card.platform === platform
        const matchPriority = !priority || card.priority === priority
        const matchTag = !tag || (() => {
          try {
            const tags: Tag[] = JSON.parse(card.tags || '[]')
            return tags.some((t) => t.label === tag)
          } catch { return false }
        })()
        if (matchSearch && matchPlatform && matchPriority && matchTag) ids.add(card.id)
      }
    }
    return ids
  }, [board, filters])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
        <Loader2 size={18} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando quadro...</span>
      </div>
    )
  }

  if (!board) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 24 }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--surface-hover)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <LayoutGrid size={28} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Nenhum quadro Kanban</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 340 }}>
            Crie seu primeiro quadro para organizar o aquecimento das contas com colunas e cartões.
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14, gap: 8 }}
          onClick={createBoard}
          disabled={creatingBoard}
        >
          {creatingBoard ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
          Criar quadro
        </button>
        <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      </div>
    )
  }

  const hasFilters = filters.search || filters.platform || filters.priority || filters.tag
  const filteredCount = filteredCardIds.size
  const totalCount = board.columns.reduce((acc, c) => acc + c.cards.length, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 24px 12px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Flame size={15} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
              {board.name}
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {board.columns.length} colunas · {totalCount} cartões
              {hasFilters ? ` · ${filteredCount} visíveis` : ''}
            </p>
          </div>
          <div style={{ flex: 1 }} />
          <button
            className="btn btn-secondary"
            style={{ height: 32, fontSize: 12, gap: 6 }}
            onClick={() => setAddingColumn(true)}
          >
            <Plus size={13} /> Nova coluna
          </button>
        </div>
        <KanbanFilters filters={filters} onChange={setFilters} allTags={allTags} />
      </div>

      {/* Board */}
      <div
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '16px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 16,
            height: '100%',
            alignItems: 'flex-start',
            minWidth: 'max-content',
          }}
        >
          {board.columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              columns={board.columns}
              filteredCardIds={filteredCardIds}
              dragInfo={dragInfo}
              onDragStart={setDragInfo}
              onDragEnd={() => setDragInfo(null)}
              onDropCard={handleDrop}
              onAddCard={addCard}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
              onDuplicateCard={duplicateCard}
              onMoveCard={moveCard}
              onRenameColumn={renameColumn}
              onDeleteColumn={deleteColumn}
              toast={toast}
            />
          ))}

          {/* Add column inline form */}
          {addingColumn ? (
            <div style={{ width: 272, minWidth: 272, flexShrink: 0 }}>
              <input
                className="input"
                style={{ fontSize: 13, marginBottom: 6 }}
                placeholder="Nome da coluna..."
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addColumn()
                  if (e.key === 'Escape') { setAddingColumn(false); setNewColTitle('') }
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, height: 32, fontSize: 12 }}
                  onClick={addColumn}
                  disabled={savingCol || !newColTitle.trim()}
                >
                  {savingCol ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  Adicionar
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                  onClick={() => { setAddingColumn(false); setNewColTitle('') }}
                >
                  <Plus size={13} style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-ghost"
              style={{
                width: 272, minWidth: 272, flexShrink: 0,
                height: 40, fontSize: 12, gap: 6,
                color: 'var(--text-muted)',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                justifyContent: 'center',
              }}
              onClick={() => setAddingColumn(true)}
            >
              <Plus size={13} /> Nova coluna
            </button>
          )}
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
