import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.text !== undefined) data.text = body.text
  if (body.completed !== undefined) data.completed = body.completed
  if (body.position !== undefined) data.position = body.position
  const item = await db.kanbanChecklist.update({ where: { id }, data })
  return NextResponse.json(item)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.kanbanChecklist.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
