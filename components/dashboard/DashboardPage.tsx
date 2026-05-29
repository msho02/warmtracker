'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Flame,
  Users,
  CheckCircle,
  PauseCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { STATUS_LABELS } from '@/lib/utils'
import PlatformIcon from '@/components/ui/PlatformIcon'

type DashboardData = {
  totalAccounts: number
  platforms: number
  warming: number
  completed: number
  paused: number
  problem: number
  not_started: number
  todayTasks: {
    accountName: string
    platformName: string
    platformIcon: string
    dayTitle: string
    dayId: string
    accountId: string
    taskCount: number
    completedCount: number
  }[]
  today: string
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
  }, [])

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: 4 }}>
          {today}
        </p>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          Visão geral do aquecimento de contas
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        <StatCard
          icon={<Users size={18} color="#3b82f6" />}
          label="Total de contas"
          value={data?.totalAccounts ?? '—'}
          bg="#eff6ff"
        />
        <StatCard
          icon={<Flame size={18} color="#f97316" />}
          label="Em aquecimento"
          value={data?.warming ?? '—'}
          bg="#fff7ed"
        />
        <StatCard
          icon={<CheckCircle size={18} color="#22c55e" />}
          label="Concluídas"
          value={data?.completed ?? '—'}
          bg="#f0fdf4"
        />
        <StatCard
          icon={<PauseCircle size={18} color="#f59e0b" />}
          label="Pausadas"
          value={data?.paused ?? '—'}
          bg="#fffbeb"
        />
        <StatCard
          icon={<AlertTriangle size={18} color="#ef4444" />}
          label="Com problema"
          value={data?.problem ?? '—'}
          bg="#fef2f2"
        />
        <StatCard
          icon={<TrendingUp size={18} color="#8b5cf6" />}
          label="Plataformas"
          value={data?.platforms ?? '—'}
          bg="#f5f3ff"
        />
      </div>

      {/* Today's tasks */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Clock size={16} color="var(--text-secondary)" />
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Atividades pendentes</h2>
          {data?.todayTasks.length ? (
            <span
              style={{
                marginLeft: 4,
                background: '#fef3c7',
                color: '#92400e',
                padding: '1px 8px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {data.todayTasks.length}
            </span>
          ) : null}
        </div>

        {!data && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Carregando...
          </div>
        )}

        {data && data.todayTasks.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <CheckCircle size={32} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              Tudo em dia! Nenhuma tarefa pendente.
            </p>
          </div>
        )}

        {data?.todayTasks.map((t, i) => (
          <div
            key={i}
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderBottom: i < data.todayTasks.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'var(--surface-hover)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
            onClick={() => router.push(`/account/${t.accountId}`)}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: 'var(--surface-hover)',
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PlatformIcon name={t.platformIcon} size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: 14 }}>{t.accountName}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {t.platformName} · {t.dayTitle}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>
                {t.completedCount}/{t.taskCount}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>tarefas</p>
            </div>
            {t.taskCount > 0 && (
              <div style={{ width: 60 }}>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(t.completedCount / t.taskCount) * 100}%`,
                      background: '#3b82f6',
                    }}
                  />
                </div>
              </div>
            )}
            <ArrowRight size={14} color="var(--text-muted)" />
          </div>
        ))}
      </div>

      {/* Quick start */}
      {data && data.totalAccounts === 0 && (
        <div
          className="card"
          style={{
            marginTop: 16,
            padding: 24,
            textAlign: 'center',
            borderStyle: 'dashed',
          }}
        >
          <Flame size={28} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Nenhuma conta ainda</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 13 }}>
            Crie uma plataforma e adicione contas para começar o aquecimento.
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/platforms')}>
            Criar plataforma
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  bg: string
}) {
  return (
    <div
      className="card"
      style={{ padding: '16px' }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          background: bg,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</p>
    </div>
  )
}
