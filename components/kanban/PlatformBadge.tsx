import { PLATFORMS } from './types'
import PlatformIcon from '@/components/ui/PlatformIcon'

type Props = { platform: string; size?: 'sm' | 'md' }

export default function PlatformBadge({ platform, size = 'sm' }: Props) {
  const found = PLATFORMS.find((p) => p.value === platform)
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
        border: `1px solid ${found.color}22`,
        whiteSpace: 'nowrap',
      }}
    >
      <PlatformIcon name={platform} size={size === 'sm' ? 11 : 13} color={found.color} />
      {found.label}
    </span>
  )
}
