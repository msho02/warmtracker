import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: cardId } = await params
  const { text, position } = await req.json()
  if (!text) return NextResponse.json({ error: 'text é obrigatório' }, { status: 400 })
  const item = await db.kanbanChecklist.create({
    data: { cardId, text, position: position ?? 0 },
  })
  return NextResponse.json(item, { status: 201 })
}
