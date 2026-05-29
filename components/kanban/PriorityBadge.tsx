import { PRIORITIES } from './types'

type Props = { priority: string; size?: 'sm' | 'md' }

export default function PriorityBadge({ priority, size = 'sm' }: Props) {
  const found = PRIORITIES.find((p) => p.value === priority)
  if (!found) return null
  const pad = size === 'sm' ? '2px 7px' : '3px 10px'
  const fs = size === 'sm' ? 11 : 12
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: pad,
        borderRadius: 999,
        fontSize: fs,
        fontWeight: 500,
        background: found.bg,
        color: found.color,
        border: `1px solid ${found.color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: size === 'sm' ? 6 : 7,
          height: size === 'sm' ? 6 : 7,
          borderRadius: '50%',
          background: found.color,
          flexShrink: 0,
        }}
      />
      {found.label}
    </span>
  )
}
