import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = await prisma.subtask.count({ where: { taskId: body.taskId } })
  const subtask = await prisma.subtask.create({
    data: {
      taskId: body.taskId,
      title: body.title,
      order: count,
    },
  })
  return NextResponse.json(subtask)
}
