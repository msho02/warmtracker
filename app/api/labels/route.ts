import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const labels = await prisma.label.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(labels)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const label = await prisma.label.create({
    data: { name: body.name, color: body.color || '#6b7280' },
  })
  return NextResponse.json(label)
}
