import { NextRequest, NextResponse } from 'next/server'
import * as OTPAuth from 'otpauth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { secret } = body

  if (!secret) return NextResponse.json({ error: 'Secret required' }, { status: 400 })

  try {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret.replace(/\s/g, '').toUpperCase()),
      digits: 6,
      period: 30,
    })

    const code = totp.generate()
    const remaining = 30 - (Math.floor(Date.now() / 1000) % 30)

    return NextResponse.json({ code, remaining })
  } catch {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 400 })
  }
}
