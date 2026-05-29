import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const task = await prisma.task.update({
    where: { id },
    data: {
      title: body.title !== undefined ? body.title : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
      completed: body.completed !== undefined ? body.completed : undefined,
    },
    include: { subtasks: { orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(task)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
