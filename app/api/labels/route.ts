import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const platformId = searchParams.get('platformId')

  const labels = await prisma.label.findMany({
    where: platformId ? { platformId } : {},
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(labels)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const label = await prisma.label.create({
    data: {
      name: body.name,
      color: body.color || '#6b7280',
      platformId: body.platformId || null,
    },
  })
  return NextResponse.json(label)
}
