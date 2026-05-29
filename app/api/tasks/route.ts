import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = await prisma.task.count({ where: { dayId: body.dayId } })
  const task = await prisma.task.create({
    data: {
      dayId: body.dayId,
      title: body.title,
      notes: body.notes || null,
      order: count,
    },
    include: { subtasks: true },
  })
  return NextResponse.json(task)
}
