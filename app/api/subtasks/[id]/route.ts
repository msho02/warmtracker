import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const subtask = await prisma.subtask.update({
    where: { id },
    data: {
      title: body.title !== undefined ? body.title : undefined,
      completed: body.completed !== undefined ? body.completed : undefined,
    },
  })
  return NextResponse.json(subtask)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.subtask.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
