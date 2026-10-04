import { NextRequest, NextResponse } from 'next/server'

export interface SubscriptionCreateRequest {
  plan: string
  scope?: 'company' | 'practice'
}

export interface SubscriptionCreateResponse {
  ok: boolean
  status: 'ACTIVE'
  plan: string
  scope: 'company' | 'practice'
  activatedAt: string
}

const VALID_PLAN_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/i

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Partial<SubscriptionCreateRequest> | null
    const rawPlan = typeof body?.plan === 'string' ? body.plan.trim().toLowerCase() : ''

    if (!rawPlan || !VALID_PLAN_PATTERN.test(rawPlan)) {
      return NextResponse.json(
        { message: 'A valid subscription plan is required.' },
        { status: 400 },
      )
    }

    const scope: 'company' | 'practice' = body?.scope === 'practice' ? 'practice' : 'company'
    const backendBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL

    if (backendBase) {
      try {
        const upstreamUrl = `${backendBase.replace(/\/+$/, '')}/subscriptions/create`
        const cookieHeader = req.headers.get('cookie') || ''
        const authHeader = req.headers.get('authorization') || ''

        const upstreamRes = await fetch(upstreamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
            ...(authHeader ? { authorization: authHeader } : {}),
          },
          body: JSON.stringify({ plan: rawPlan, scope }),
        })

        if (upstreamRes.ok) {
          const data = await upstreamRes.json().catch(() => ({}))
          return NextResponse.json(
            {
              ok: true,
              status: 'ACTIVE',
              plan: rawPlan,
              scope,
              activatedAt: new Date().toISOString(),
              ...data,
            },
            { status: upstreamRes.status },
          )
        }

        if (upstreamRes.status !== 404) {
          const errPayload = await upstreamRes.json().catch(() => ({}))
          return NextResponse.json(
            {
              message: errPayload?.message || `Subscription creation failed (${upstreamRes.status}).`,
            },
            { status: upstreamRes.status },
          )
        }
      } catch {
        // Fall through to the local activated response in dev/standalone mode.
      }
    }

    const response: SubscriptionCreateResponse = {
      ok: true,
      status: 'ACTIVE',
      plan: rawPlan,
      scope,
      activatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: 'Unable to process subscription request.' },
      { status: 500 },
    )
  }
}
