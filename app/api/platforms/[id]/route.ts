import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const platform = await prisma.platform.update({
    where: { id },
    data: {
      name: body.name,
      icon: body.icon,
      color: body.color,
    },
  })
  return NextResponse.json(platform)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.platform.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
