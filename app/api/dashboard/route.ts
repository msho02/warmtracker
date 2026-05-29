import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const [totalAccounts, byStatus, platforms, accounts] = await Promise.all([
    prisma.account.count(),
    prisma.account.groupBy({ by: ['status'], _count: true }),
    prisma.platform.count(),
    prisma.account.findMany({
      include: {
        platform: true,
        days: {
          include: {
            tasks: { include: { subtasks: true } },
          },
        },
      },
    }),
  ])

  const today = new Date()
  const todayTasks: Array<{
    accountName: string
    platformName: string
    platformIcon: string
    dayTitle: string
    dayId: string
    accountId: string
    taskCount: number
    completedCount: number
  }> = []

  accounts.forEach((account) => {
    const pendingDays = account.days.filter((d) => d.status !== 'completed')
    if (pendingDays.length > 0) {
      const day = pendingDays[0]
      const taskCount = day.tasks.length
      const completedCount = day.tasks.filter((t) => t.completed).length
      if (taskCount > 0 || day.status === 'not_started') {
        todayTasks.push({
          accountName: account.name,
          platformName: account.platform.name,
          platformIcon: account.platform.icon || '🌐',
          dayTitle: day.title,
          dayId: day.id,
          accountId: account.id,
          taskCount,
          completedCount,
        })
      }
    }
  })

  const statusMap: Record<string, number> = {}
  byStatus.forEach((s) => {
    statusMap[s.status] = s._count
  })

  return NextResponse.json({
    totalAccounts,
    platforms,
    warming: statusMap['warming'] || 0,
    completed: statusMap['completed'] || 0,
    paused: statusMap['paused'] || 0,
    problem: statusMap['problem'] || 0,
    not_started: statusMap['not_started'] || 0,
    todayTasks,
    today: today.toISOString(),
  })
}
