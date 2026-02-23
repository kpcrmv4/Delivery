import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createOrder } from '@/lib/supabase/queries'
import { generateOrderNumber } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json()

  const orderData = {
    shop_id: body.shop_id || process.env.NEXT_PUBLIC_SHOP_ID || '',
    customer_id: user?.id,
    order_number: generateOrderNumber(),
    subtotal: body.subtotal,
    delivery_fee: body.delivery_fee,
    discount: body.discount || 0,
    total: body.total,
    payment_method: body.payment_method,
    delivery_address: body.delivery_address,
    customer_phone: body.customer_phone || '',
    customer_name: body.customer_name || user?.user_metadata?.full_name || '',
    order_type: body.order_type || 'delivery',
    scheduled_date: body.scheduled_date,
    scheduled_slot: body.scheduled_slot,
    note: body.note || '',
    promotion_id: body.promotion_id,
    promotion_code: body.promotion_code,
    channel: body.channel || 'web',
    items: body.items,
  }

  const { data, error } = await createOrder(supabase, orderData)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Update daily product sales
  const today = new Date().toISOString().split('T')[0]
  for (const item of body.items) {
    await supabase.rpc('increment_daily_sales', {
      p_shop_id: orderData.shop_id,
      p_product_id: item.product_id,
      p_sale_date: today,
      p_quantity: item.quantity,
    }).catch(() => {
      // Fallback: upsert manually
      supabase
        .from('daily_product_sales')
        .upsert(
          {
            shop_id: orderData.shop_id,
            product_id: item.product_id,
            sale_date: today,
            quantity_sold: item.quantity,
          },
          { onConflict: 'shop_id,product_id,sale_date' }
        )
    })
  }

  return NextResponse.json({ data })
}
