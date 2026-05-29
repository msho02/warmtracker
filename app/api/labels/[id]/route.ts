import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const label = await prisma.label.update({
    where: { id },
    data: {
      name: body.name !== undefined ? body.name : undefined,
      color: body.color !== undefined ? body.color : undefined,
    },
  })
  return NextResponse.json(label)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.label.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
