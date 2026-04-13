import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { memberId, action } = await request.json()

  if (action === 'verify') {
    await supabase.from('profiles').update({ is_verified: true }).eq('id', memberId)
    return NextResponse.json({ success: true, message: 'Member verified' })
  }

  if (action === 'unverify') {
    await supabase.from('profiles').update({ is_verified: false }).eq('id', memberId)
    return NextResponse.json({ success: true, message: 'Verification removed' })
  }

  if (action === 'make-admin') {
    await supabase.from('profiles').update({ is_admin: true }).eq('id', memberId)
    return NextResponse.json({ success: true, message: 'Member is now admin' })
  }

  if (action === 'manual-checkin') {
    const { data: current } = await supabase
      .from('profiles')
      .select('checkin_count')
      .eq('id', memberId)
      .single()

    await supabase
      .from('profiles')
      .update({
        checkin_count: (current?.checkin_count ?? 0) + 1,
        is_verified: true,
      })
      .eq('id', memberId)

    return NextResponse.json({ success: true, message: 'Manual check-in added' })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
