import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/emails', label: 'Email blasts' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 border-b border-zinc-100 -mx-4 px-4 pb-4">
        <span className="text-xs text-zinc-400 mr-2">Admin</span>
        {ADMIN_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm px-3 py-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  )
}
