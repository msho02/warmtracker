import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: boardId } = await params
  const { title, position } = await req.json()
  const column = await db.kanbanColumn.create({
    data: { boardId, title: title || 'Nova coluna', position: position ?? 0 },
    include: { cards: { include: { checklistItems: true } } },
  })
  return NextResponse.json(column, { status: 201 })
}
