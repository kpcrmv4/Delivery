import { createServerSupabaseClient } from '@/lib/supabase/server'
import { updateOrderStatus } from '@/lib/supabase/queries'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { status, note } = body

  const { data, error } = await updateOrderStatus(
    supabase,
    params.id,
    status,
    user.id,
    note
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
