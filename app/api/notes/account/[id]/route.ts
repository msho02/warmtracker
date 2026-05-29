import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const note = await prisma.accountNote.create({
    data: { accountId: id, content: body.content },
  })
  return NextResponse.json(note)
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const notes = await prisma.accountNote.findMany({
    where: { accountId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notes)
}
