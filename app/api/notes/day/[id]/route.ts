import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const note = await prisma.dayNote.create({
    data: { dayId: id, content: body.content },
  })
  return NextResponse.json(note)
}
