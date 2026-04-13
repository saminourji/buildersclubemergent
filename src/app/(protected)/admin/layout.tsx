import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <>
      <div style={{ fontSize: 11, color: '#828282', marginBottom: 8 }}>
        admin: {' '}
        <Link href="/admin">overview</Link>{' | '}
        <Link href="/admin/members">members</Link>{' | '}
        <Link href="/admin/meetings">meetings</Link>{' | '}
        <Link href="/admin/emails">emails</Link>
      </div>
      <hr />
      {children}
    </>
  )
}
