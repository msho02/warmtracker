import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { columnId, title, description, platform, priority, accountName, username,
    phoneOrIdentifier, niche, notes, tags, dueDate, warmupStartDate, warmupEndDate, position } = body

  if (!columnId || !title) {
    return NextResponse.json({ error: 'columnId e title são obrigatórios' }, { status: 400 })
  }

  const card = await db.kanbanCard.create({
    data: {
      columnId,
      title,
      description: description || null,
      platform: platform || null,
      priority: priority || 'medium',
      accountName: accountName || null,
      username: username || null,
      phoneOrIdentifier: phoneOrIdentifier || null,
      niche: niche || null,
      notes: notes || null,
      tags: tags ? JSON.stringify(tags) : '[]',
      dueDate: dueDate || null,
      warmupStartDate: warmupStartDate || null,
      warmupEndDate: warmupEndDate || null,
      position: position ?? 0,
    },
    include: { checklistItems: { orderBy: { position: 'asc' } } },
  })
  return NextResponse.json(card, { status: 201 })
}
