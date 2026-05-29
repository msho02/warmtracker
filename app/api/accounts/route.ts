import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const platformId = searchParams.get('platformId')

  const accounts = await prisma.account.findMany({
    where: platformId ? { platformId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      platform: true,
      category: true,
      days: {
        include: {
          tasks: {
            include: { subtasks: true },
          },
        },
      },
    },
  })
  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const account = await prisma.account.create({
    data: {
      platformId: body.platformId,
      name: body.name,
      username: body.username || null,
      password: body.password || null,
      notes: body.notes || null,
      photo: body.photo || null,
      status: body.status || 'not_started',
      totpSecret: body.totpSecret || null,
      totalDays: body.totalDays || 30,
    },
  })

  // Generate schedule days
  const days = []
  for (let i = 1; i <= account.totalDays; i++) {
    days.push({
      accountId: account.id,
      dayNumber: i,
      title: `Dia ${i}`,
      status: 'not_started',
      order: i,
    })
  }
  await prisma.scheduleDay.createMany({ data: days })

  const full = await prisma.account.findUnique({
    where: { id: account.id },
    include: {
      platform: true,
      days: {
        orderBy: { order: 'asc' },
        include: { tasks: { include: { subtasks: true } } },
      },
    },
  })

  return NextResponse.json(full)
}
