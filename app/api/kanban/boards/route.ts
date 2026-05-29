import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'

const DEFAULT_COLUMNS = [
  'Novas contas',
  'Aquecendo',
  'Em observação',
  'Prontas',
  'Problemas',
  'Pausadas',
]

export async function GET() {
  const boards = await db.kanbanBoard.findMany({
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            orderBy: { position: 'asc' },
            include: { checklistItems: { orderBy: { position: 'asc' } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(boards)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const name = (body.name || 'Meu Quadro').trim()

  const board = await db.kanbanBoard.create({
    data: {
      name,
      columns: {
        create: DEFAULT_COLUMNS.map((title, i) => ({ title, position: i })),
      },
    },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: { cards: { include: { checklistItems: true } } },
      },
    },
  })
  return NextResponse.json(board, { status: 201 })
}
