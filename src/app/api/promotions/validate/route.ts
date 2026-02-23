import { createServerSupabaseClient } from '@/lib/supabase/server'
import { validatePromoCode } from '@/lib/supabase/queries'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const body = await request.json()
  const { code, subtotal } = body

  if (!code) {
    return NextResponse.json({ valid: false, error: 'กรุณากรอกโค้ด' }, { status: 400 })
  }

  const result = await validatePromoCode(supabase, code)

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 400 })
  }

  const promotion = result.promotion as unknown as Record<string, unknown>
  const actions = (promotion?.actions || {}) as Record<string, unknown>

  // Calculate discount based on promotion type
  let discount = 0
  switch (promotion?.promotion_type) {
    case 'ORDER_DISCOUNT': {
      const pct = (actions.discount_percent as number) || 0
      const max = (actions.max_discount as number) || 999999
      discount = Math.min(subtotal * (pct / 100), max)
      break
    }
    case 'DELIVERY_DISCOUNT':
      discount = (actions.discount_amount as number) || 0
      break
    case 'NEW_CUSTOMER':
      discount = (actions.discount_amount as number) || 0
      break
    default:
      discount = (actions.discount_amount as number) || 0
  }

  return NextResponse.json({
    valid: true,
    discount,
    promotion_id: promotion?.id,
    promotion_type: promotion?.promotion_type,
  })
}
