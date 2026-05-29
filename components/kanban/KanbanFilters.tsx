'use client'

import { Search, X } from 'lucide-react'
import { PLATFORMS, PRIORITIES } from './types'

export type FilterState = {
  search: string
  platform: string
  priority: string
  tag: string
}

type Props = {
  filters: FilterState
  onChange: (f: FilterState) => void
  allTags: string[]
}

export default function KanbanFilters({ filters, onChange, allTags }: Props) {
  const set = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value })
  const hasFilters = filters.search || filters.platform || filters.priority || filters.tag

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={13}
          style={{
            position: 'absolute',
            left: 9,
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          className="input"
          placeholder="Buscar cartões..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          style={{ paddingLeft: 28, width: 200, height: 32, fontSize: 12 }}
        />
      </div>

      <select
        className="input"
        value={filters.platform}
        onChange={(e) => set('platform', e.target.value)}
        style={{ width: 'auto', height: 32, fontSize: 12, cursor: 'pointer' }}
      >
        <option value="">Plataforma</option>
        {PLATFORMS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      <select
        className="input"
        value={filters.priority}
        onChange={(e) => set('priority', e.target.value)}
        style={{ width: 'auto', height: 32, fontSize: 12, cursor: 'pointer' }}
      >
        <option value="">Prioridade</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {allTags.length > 0 && (
        <select
          className="input"
          value={filters.tag}
          onChange={(e) => set('tag', e.target.value)}
          style={{ width: 'auto', height: 32, fontSize: 12, cursor: 'pointer' }}
        >
          <option value="">Tag</option>
          {allTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button
          className="btn btn-ghost"
          style={{ height: 32, fontSize: 12, gap: 4, padding: '0 10px' }}
          onClick={() => onChange({ search: '', platform: '', priority: '', tag: '' })}
        >
          <X size={12} />
          Limpar
        </button>
      )}
    </div>
  )
}
