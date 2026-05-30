'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  Plus,
  Layers,
  Flame,
  Sun,
  Moon,
  Table2,
  LogOut,
} from 'lucide-react'
import PlatformIcon from '@/components/ui/PlatformIcon'

type Platform = {
  id: string
  name: string
  icon: string | null
  color: string | null
  _count: { accounts: number }
}

type Props = {
  open: boolean
  onToggle: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Sidebar({ open, onToggle, theme, onToggleTheme }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [expandedPlatforms, setExpandedPlatforms] = useState(true)

  useEffect(() => {
    fetch('/api/platforms')
      .then((r) => r.json())
      .then(setPlatforms)
      .catch(() => {})
  }, [])

  const nav = (path: string) => router.push(path)
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <aside
      className="sidebar"
      style={{
        width: open ? 'var(--sidebar-width)' : '52px',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: 'var(--accent)',
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Flame size={15} color={theme === 'dark' ? '#000' : 'white'} />
        </div>
        {open && (
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            WarmTracker
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost" style={{ padding: '4px', minWidth: 0 }} onClick={onToggle}>
          {open ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: '8px' }}>
        <SidebarItem
          icon={<LayoutDashboard size={15} />}
          label="Dashboard"
          open={open}
          active={pathname === '/'}
          onClick={() => nav('/')}
        />
        <SidebarItem
          icon={<Table2 size={15} />}
          label="Planilha Global"
          open={open}
          active={isActive('/planilha')}
          onClick={() => nav('/planilha')}
        />
        <div className="divider" style={{ margin: '6px 0' }} />

        {/* Platforms section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
          onClick={() => setExpandedPlatforms(!expandedPlatforms)}
        >
          {open && (
            <>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  flex: 1,
                }}
              >
                Redes Sociais
              </span>
              <ChevronRight
                size={12}
                color="var(--text-muted)"
                style={{
                  transform: expandedPlatforms ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s',
                }}
              />
            </>
          )}
          {!open && <Layers size={15} style={{ color: 'var(--text-muted)' }} />}
        </div>

        {expandedPlatforms &&
          platforms.map((p) => (
            <SidebarItem
              key={p.id}
              icon={<PlatformIcon name={p.icon || 'default'} size={16} />}
              label={p.name}
              badge={p._count.accounts}
              open={open}
              active={isActive(`/platform/${p.id}`)}
              onClick={() => nav(`/platform/${p.id}`)}
            />
          ))}

        <SidebarItem
          icon={<Plus size={15} />}
          label="Nova plataforma"
          open={open}
          active={false}
          onClick={() => nav('/platforms')}
          muted
        />
      </div>

      {/* Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <SidebarItem
          icon={theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          open={open}
          active={false}
          onClick={onToggleTheme}
        />
        <SidebarItem
          icon={<Layers size={15} />}
          label="Plataformas"
          open={open}
          active={isActive('/platforms')}
          onClick={() => nav('/platforms')}
        />
        <SidebarItem
          icon={<LogOut size={15} />}
          label="Sair"
          open={open}
          active={false}
          muted
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            nav('/login')
          }}
        />
      </div>
    </aside>
  )
}

function SidebarItem({
  icon,
  label,
  open,
  active,
  onClick,
  badge,
  muted,
}: {
  icon: React.ReactNode
  label: string
  open: boolean
  active?: boolean
  onClick: () => void
  badge?: number
  muted?: boolean
}) {
  return (
    <div
      className={`sidebar-item ${active ? 'active' : ''}`}
      onClick={onClick}
      title={!open ? label : undefined}
      style={{ color: muted ? 'var(--text-muted)' : undefined }}
    >
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {open && (
        <>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
          {badge !== undefined && badge > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                background: 'var(--surface-hover)',
                padding: '1px 6px',
                borderRadius: 999,
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </div>
  )
}
