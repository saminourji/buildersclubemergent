import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Restrict to brown.edu emails
  const email = user.email ?? ''
  if (!email.endsWith('@brown.edu') && !email.endsWith('@alumni.brown.edu')) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=not_brown`)
  }

  // Upsert profile
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  const isAdmin = adminEmails.includes(email)

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, onboarding_complete')
    .eq('id', user.id)
    .single()

  if (!existing) {
    await supabase.from('profiles').insert({
      id: user.id,
      email,
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      is_admin: isAdmin,
    })
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  // Make admin if email matches
  if (isAdmin && !existing) {
    await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id)
  }

  if (!existing.onboarding_complete) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
