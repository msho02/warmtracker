import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = await db.kanbanCard.findUnique({
    where: { id },
    include: { checklistItems: { orderBy: { position: 'asc' } } },
  })
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(card)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  const fields = ['title','description','platform','priority','accountName','username',
    'phoneOrIdentifier','niche','notes','dueDate','warmupStartDate','warmupEndDate',
    'columnId','position']
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f]
  }
  if (body.tags !== undefined) data.tags = JSON.stringify(body.tags)

  const card = await db.kanbanCard.update({
    where: { id },
    data,
    include: { checklistItems: { orderBy: { position: 'asc' } } },
  })
  return NextResponse.json(card)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.kanbanCard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
