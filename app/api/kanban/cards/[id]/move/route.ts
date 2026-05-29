import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { columnId, position } = await req.json()
  const card = await db.kanbanCard.update({
    where: { id },
    data: { columnId, position },
    include: { checklistItems: { orderBy: { position: 'asc' } } },
  })
  return NextResponse.json(card)
}
