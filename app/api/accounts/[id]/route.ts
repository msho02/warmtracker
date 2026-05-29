import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      platform: true,
      category: true,
      days: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
            include: {
              subtasks: { orderBy: { order: 'asc' } },
              taskNotes: { orderBy: { createdAt: 'desc' } },
            },
          },
          dayNotes: { orderBy: { createdAt: 'desc' } },
        },
      },
      accountNotes: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(account)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const account = await prisma.account.update({
    where: { id },
    data: {
      name: body.name !== undefined ? body.name : undefined,
      username: body.username !== undefined ? body.username : undefined,
      password: body.password !== undefined ? body.password : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
      photo: body.photo !== undefined ? body.photo : undefined,
      status: body.status !== undefined ? body.status : undefined,
      totpSecret: body.totpSecret !== undefined ? body.totpSecret : undefined,
      slot: body.slot !== undefined ? body.slot : undefined,
      phone: body.phone !== undefined ? body.phone : undefined,
      categoryId: body.categoryId !== undefined ? body.categoryId : undefined,
      stock: body.stock !== undefined ? body.stock : undefined,
      supplier: body.supplier !== undefined ? body.supplier : undefined,
      planPaymentDate: body.planPaymentDate !== undefined ? body.planPaymentDate : undefined,
      annotations: body.annotations !== undefined ? body.annotations : undefined,
    },
    include: { category: true },
  })
  return NextResponse.json(account)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.account.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
