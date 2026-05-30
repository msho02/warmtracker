import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

function makeToken() {
  const secret = process.env.SESSION_SECRET || 'fallback-secret'
  const payload = `auth:${Date.now()}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}:${sig}`
}

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const expected = process.env.APP_PASSWORD

  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = makeToken()
  const cookieStore = await cookies()
  cookieStore.set('wt_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
