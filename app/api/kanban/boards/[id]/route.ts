import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const board = await db.kanbanBoard.findUnique({
    where: { id },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            orderBy: { position: 'asc' },
            include: { checklistItems: { orderBy: { position: 'asc' } } },
          },
        },
      },
    },
  })
  if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(board)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name } = await req.json()
  const board = await db.kanbanBoard.update({ where: { id }, data: { name } })
  return NextResponse.json(board)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.kanbanBoard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
