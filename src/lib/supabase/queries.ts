import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Shop, Category, Product, ProductOption, Banner,
  Order, Promotion, PromotionCode, CustomerAddress,
  Profile, Driver,
} from '@/types'

// ─── Helper: get shop ID from env ───
export function getShopId(): string {
  return process.env.NEXT_PUBLIC_SHOP_ID || ''
}

// ─── Shop ───
export async function getShop(supabase: SupabaseClient, shopId?: string) {
  const id = shopId || getShopId()
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', id)
    .single()
  return { data: data as Shop | null, error }
}

// ─── Categories ───
export async function getCategories(supabase: SupabaseClient, shopId?: string) {
  const id = shopId || getShopId()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', id)
    .order('sort_order')
  return { data: (data || []) as Category[], error }
}

export async function getCategoriesWithCount(supabase: SupabaseClient, shopId?: string) {
  const id = shopId || getShopId()
  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .eq('shop_id', id)
    .order('sort_order')
  return {
    data: (data || []).map((c: Record<string, unknown>) => ({
      ...c,
      product_count: (c.products as { count: number }[])?.[0]?.count || 0,
    })),
    error,
  }
}

export async function upsertCategory(
  supabase: SupabaseClient,
  category: Partial<Category> & { shop_id: string }
) {
  if (category.id) {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', category.id)
      .select()
      .single()
    return { data, error }
  }
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()
  return { data, error }
}

export async function deleteCategory(supabase: SupabaseClient, id: string) {
  return supabase.from('categories').delete().eq('id', id)
}

// ─── Products ───
export async function getProducts(supabase: SupabaseClient, shopId?: string, filters?: {
  status?: string
  categoryId?: string
  search?: string
  recommended?: boolean
}) {
  const id = shopId || getShopId()
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, icon),
      options:product_options(
        *,
        choices:product_option_choices(*)
      )
    `)
    .eq('shop_id', id)

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`)
  if (filters?.recommended) query = query.eq('is_recommended', true)

  const { data: products, error } = await query.order('sort_order')

  if (error || !products) return { data: [] as Product[], error }

  // Get daily sales for today
  const productIds = products.map((p: Record<string, unknown>) => p.id as string)
  const { data: sales } = await supabase
    .from('daily_product_sales')
    .select('product_id, quantity_sold')
    .eq('shop_id', id)
    .eq('sale_date', today)
    .in('product_id', productIds)

  const salesMap: Record<string, number> = {}
  if (sales) {
    sales.forEach((s: Record<string, unknown>) => {
      salesMap[s.product_id as string] = s.quantity_sold as number
    })
  }

  const mapped: Product[] = products.map((p: Record<string, unknown>) => ({
    ...p,
    daily_sold: salesMap[p.id as string] || 0,
    options: ((p.options as Record<string, unknown>[]) || [])
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        (a.sort_order as number) - (b.sort_order as number)
      )
      .map((opt: Record<string, unknown>) => ({
        ...opt,
        choices: ((opt.choices as Record<string, unknown>[]) || [])
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
            (a.sort_order as number) - (b.sort_order as number)
          ),
      })),
  })) as unknown as Product[]

  return { data: mapped, error: null }
}

export async function getProductById(supabase: SupabaseClient, productId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, icon),
      options:product_options(
        *,
        choices:product_option_choices(*)
      )
    `)
    .eq('id', productId)
    .single()

  if (error || !product) return { data: null, error }

  // Get daily sales
  const { data: sales } = await supabase
    .from('daily_product_sales')
    .select('quantity_sold')
    .eq('product_id', productId)
    .eq('sale_date', today)
    .maybeSingle()

  const mapped: Product = {
    ...(product as unknown as Product),
    daily_sold: (sales?.quantity_sold as number) || 0,
    options: ((product.options as Record<string, unknown>[]) || [])
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        (a.sort_order as number) - (b.sort_order as number)
      )
      .map((opt: Record<string, unknown>) => ({
        ...opt,
        choices: ((opt.choices as Record<string, unknown>[]) || [])
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
            (a.sort_order as number) - (b.sort_order as number)
          ),
      })) as unknown as ProductOption[],
  }

  return { data: mapped, error: null }
}

export async function upsertProduct(
  supabase: SupabaseClient,
  product: Record<string, unknown>
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { options, category, daily_sold, ...productData } = product
  if (product.id) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', product.id)
      .select()
      .single()
    return { data, error }
  }
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()
  return { data, error }
}

export async function deleteProduct(supabase: SupabaseClient, id: string) {
  return supabase.from('products').delete().eq('id', id)
}

// ─── Banners ───
export async function getBanners(supabase: SupabaseClient, shopId?: string) {
  const id = shopId || getShopId()
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('shop_id', id)
    .eq('is_active', true)
    .order('sort_order')
  return { data: (data || []) as Banner[], error }
}

// ─── Orders ───
export async function getOrders(supabase: SupabaseClient, opts: {
  shopId?: string
  customerId?: string
  driverId?: string
  status?: string | string[]
  limit?: number
}) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      driver:profiles!orders_driver_id_fkey(id, full_name, phone, avatar_url),
      customer:profiles!orders_customer_id_fkey(id, full_name, phone, avatar_url)
    `)

  if (opts.shopId) query = query.eq('shop_id', opts.shopId)
  if (opts.customerId) query = query.eq('customer_id', opts.customerId)
  if (opts.driverId) query = query.eq('driver_id', opts.driverId)
  if (opts.status) {
    if (Array.isArray(opts.status)) {
      query = query.in('status', opts.status)
    } else {
      query = query.eq('status', opts.status)
    }
  }
  if (opts.limit) query = query.limit(opts.limit)

  const { data, error } = await query.order('created_at', { ascending: false })

  const mapped = (data || []).map((o: Record<string, unknown>) => ({
    ...o,
    items: ((o.items as Record<string, unknown>[]) || []).map((item: Record<string, unknown>) => ({
      ...item,
      options: item.options || [],
    })),
    driver: o.driver || null,
  }))

  return { data: mapped as unknown as Order[], error }
}

export async function getOrderById(supabase: SupabaseClient, orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      driver:profiles!orders_driver_id_fkey(id, full_name, phone, avatar_url),
      customer:profiles!orders_customer_id_fkey(id, full_name, phone, avatar_url)
    `)
    .eq('id', orderId)
    .single()

  if (error || !data) return { data: null, error }

  const mapped = {
    ...data,
    items: ((data.items as Record<string, unknown>[]) || []).map((item: Record<string, unknown>) => ({
      ...item,
      options: item.options || [],
    })),
    driver: data.driver || null,
  }

  return { data: mapped as unknown as Order, error: null }
}

export async function createOrder(supabase: SupabaseClient, order: {
  shop_id: string
  customer_id?: string
  order_number: string
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  payment_method: string
  delivery_address?: Record<string, unknown>
  customer_phone: string
  customer_name: string
  order_type: string
  scheduled_date?: string
  scheduled_slot?: string
  note?: string
  promotion_id?: string
  promotion_code?: string
  items: {
    product_id: string
    product_name: string
    product_image: string
    product_price: number
    quantity: number
    options: Record<string, unknown>[]
    item_note: string
    total_price: number
  }[]
}) {
  const { items, ...orderData } = order

  // Create order
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (orderError || !newOrder) return { data: null, error: orderError }

  // Create order items
  const orderItems = items.map((item) => ({
    ...item,
    order_id: (newOrder as Record<string, unknown>).id,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) return { data: null, error: itemsError }

  // Log initial status
  await supabase.from('order_status_logs').insert({
    order_id: (newOrder as Record<string, unknown>).id,
    status: 'pending',
    changed_by: order.customer_id,
  })

  return { data: newOrder as unknown as Order, error: null }
}

export async function updateOrderStatus(
  supabase: SupabaseClient,
  orderId: string,
  status: string,
  userId?: string,
  note?: string
) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (!error) {
    await supabase.from('order_status_logs').insert({
      order_id: orderId,
      status,
      changed_by: userId,
      note,
    })
  }

  return { data, error }
}

export async function assignDriver(
  supabase: SupabaseClient,
  orderId: string,
  driverId: string
) {
  return supabase
    .from('orders')
    .update({ driver_id: driverId })
    .eq('id', orderId)
    .select()
    .single()
}

// ─── Promotions ───
export async function getPromotions(supabase: SupabaseClient, shopId?: string, activeOnly = false) {
  const id = shopId || getShopId()
  let query = supabase
    .from('promotions')
    .select(`
      *,
      codes:promotion_codes(*),
      usages:promotion_usages(count)
    `)
    .eq('shop_id', id)

  if (activeOnly) query = query.eq('is_active', true)

  const { data, error } = await query.order('priority', { ascending: false })

  const mapped = (data || []).map((p: Record<string, unknown>) => ({
    ...p,
    codes: (p.codes || []) as PromotionCode[],
    usage_count: (p.usages as { count: number }[])?.[0]?.count || 0,
    limits: p.limits || {},
  }))

  return { data: mapped as unknown as Promotion[], error }
}

export async function validatePromoCode(supabase: SupabaseClient, code: string, shopId?: string) {
  const id = shopId || getShopId()

  const { data: promoCode, error } = await supabase
    .from('promotion_codes')
    .select(`
      *,
      promotion:promotions(*)
    `)
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !promoCode) return { valid: false, error: 'โค้ดไม่ถูกต้อง' }

  const promotion = (promoCode as Record<string, unknown>).promotion as Record<string, unknown>
  if (!promotion || !(promotion.is_active as boolean)) return { valid: false, error: 'โปรโมชั่นหมดอายุ' }
  if (promotion.shop_id !== id) return { valid: false, error: 'โค้ดไม่สามารถใช้กับร้านนี้ได้' }

  const now = new Date()
  if (new Date(promotion.starts_at as string) > now) return { valid: false, error: 'โปรโมชั่นยังไม่เริ่ม' }
  if (promotion.ends_at && new Date(promotion.ends_at as string) < now) return { valid: false, error: 'โปรโมชั่นหมดอายุ' }

  const pc = promoCode as Record<string, unknown>
  if (pc.max_uses && (pc.used_count as number) >= (pc.max_uses as number)) return { valid: false, error: 'โค้ดถูกใช้ครบแล้ว' }

  return { valid: true, promotion: promotion as unknown as Promotion, promoCode }
}

export async function upsertPromotion(
  supabase: SupabaseClient,
  promotion: Record<string, unknown>
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { codes, usages, usage_count, ...promoData } = promotion
  if (promotion.id) {
    const { data, error } = await supabase
      .from('promotions')
      .update(promoData)
      .eq('id', promotion.id)
      .select()
      .single()
    return { data, error }
  }
  const { data, error } = await supabase
    .from('promotions')
    .insert(promoData)
    .select()
    .single()
  return { data, error }
}

export async function deletePromotion(supabase: SupabaseClient, id: string) {
  return supabase.from('promotions').delete().eq('id', id)
}

// ─── Profiles / Drivers ───
export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data: data as Profile | null, error }
}

export async function updateProfile(supabase: SupabaseClient, userId: string, updates: Partial<Profile>) {
  return supabase.from('profiles').update(updates).eq('id', userId).select().single()
}

export async function getDrivers(supabase: SupabaseClient, shopId?: string) {
  const id = shopId || getShopId()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('shop_id', id)
    .eq('role', 'driver')

  if (error || !data) return { data: [] as Driver[], error }

  // Get delivery counts
  const driverIds = data.map((d: Record<string, unknown>) => d.id as string)
  const { data: deliveryCounts } = await supabase
    .from('orders')
    .select('driver_id')
    .in('driver_id', driverIds)
    .eq('status', 'delivered')

  const countMap: Record<string, number> = {}
  if (deliveryCounts) {
    deliveryCounts.forEach((o: Record<string, unknown>) => {
      const did = o.driver_id as string
      countMap[did] = (countMap[did] || 0) + 1
    })
  }

  const drivers: Driver[] = data.map((d: Record<string, unknown>) => ({
    id: d.id as string,
    name: d.full_name as string,
    phone: d.phone as string,
    avatar_url: d.avatar_url as string,
    status: 'available' as const,
    total_deliveries: countMap[d.id as string] || 0,
  }))

  return { data: drivers, error: null }
}

// ─── Customer Addresses ───
export async function getCustomerAddresses(supabase: SupabaseClient, customerId: string) {
  const { data, error } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false })
  return { data: (data || []) as CustomerAddress[], error }
}

export async function upsertAddress(supabase: SupabaseClient, address: Partial<CustomerAddress> & { customer_id: string }) {
  if (address.id) {
    return supabase.from('customer_addresses').update(address).eq('id', address.id).select().single()
  }
  return supabase.from('customer_addresses').insert(address).select().single()
}

export async function deleteAddress(supabase: SupabaseClient, id: string) {
  return supabase.from('customer_addresses').delete().eq('id', id)
}

// ─── Dashboard Stats ───
export async function getDashboardStats(supabase: SupabaseClient, shopId?: string) {
  const id = shopId || getShopId()
  const today = new Date().toISOString().split('T')[0]
  const todayStart = `${today}T00:00:00`
  const todayEnd = `${today}T23:59:59`

  const [ordersToday, revenue, pendingOrders] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', id)
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
    supabase
      .from('orders')
      .select('total')
      .eq('shop_id', id)
      .eq('status', 'delivered')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', id)
      .in('status', ['pending', 'confirmed', 'preparing']),
  ])

  const totalRevenue = (revenue.data || []).reduce(
    (sum: number, o: Record<string, unknown>) => sum + Number(o.total || 0), 0
  )

  return {
    ordersToday: ordersToday.count || 0,
    revenueToday: totalRevenue,
    pendingOrders: pendingOrders.count || 0,
  }
}

// ─── Realtime subscriptions ───
export function subscribeToOrders(
  supabase: SupabaseClient,
  shopId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `shop_id=eq.${shopId}`,
      },
      callback
    )
    .subscribe()
}

export function subscribeToOrderById(
  supabase: SupabaseClient,
  orderId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      callback
    )
    .subscribe()
}
