import { STATUS_LABELS } from '@/lib/utils'

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  not_started: { background: '#f4f4f5', color: '#52525b', borderColor: '#e4e4e7' },
  warming: { background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
  in_progress: { background: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe' },
  paused: { background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' },
  completed: { background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' },
  problem: { background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' },
}

const DOT_COLORS: Record<string, string> = {
  not_started: '#a1a1aa',
  warming: '#3b82f6',
  in_progress: '#8b5cf6',
  paused: '#f59e0b',
  completed: '#22c55e',
  problem: '#ef4444',
}

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.not_started
  const dot = DOT_COLORS[status] || DOT_COLORS.not_started

  return (
    <span
      style={{
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        border: '1px solid',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: dot,
          flexShrink: 0,
        }}
      />
      {STATUS_LABELS[status] || status}
    </span>
  )
}
