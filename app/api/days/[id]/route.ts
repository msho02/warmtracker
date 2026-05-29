import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const day = await prisma.scheduleDay.update({
    where: { id },
    data: {
      title: body.title,
      notes: body.notes,
      status: body.status,
    },
    include: {
      tasks: {
        orderBy: { order: 'asc' },
        include: { subtasks: { orderBy: { order: 'asc' } } },
      },
    },
  })
  return NextResponse.json(day)
}
