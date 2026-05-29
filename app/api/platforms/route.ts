import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const platforms = await prisma.platform.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { accounts: true } },
    },
  })
  return NextResponse.json(platforms)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const platform = await prisma.platform.create({
    data: {
      name: body.name,
      icon: body.icon || null,
      color: body.color || null,
    },
  })
  return NextResponse.json(platform)
}
