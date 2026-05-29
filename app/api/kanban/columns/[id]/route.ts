import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.position !== undefined) data.position = body.position
  const column = await db.kanbanColumn.update({ where: { id }, data })
  return NextResponse.json(column)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const col = await db.kanbanColumn.findUnique({ where: { id }, include: { cards: true } })
  if (!col) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (col.cards.length > 0) {
    return NextResponse.json(
      { error: 'Esta coluna possui cartões. Mova os cartões antes de excluir a coluna.' },
      { status: 400 }
    )
  }
  await db.kanbanColumn.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
