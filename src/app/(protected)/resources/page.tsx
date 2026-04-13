import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const RESOURCES = [
  {
    category: 'Community',
    items: [
      { title: 'Builders Club Slack', description: 'Join the community workspace', link: 'https://join.slack.com/your-workspace', cta: 'Join Slack' },
      { title: 'Member Directory', description: 'Find collaborators and co-founders', link: '/directory', cta: 'Browse' },
    ],
  },
  {
    category: 'Funding',
    items: [
      { title: 'Brown UTRA', description: 'Undergraduate teaching and research awards', link: 'https://www.brown.edu/academics/college/fellowships/utra/', cta: 'Apply' },
      { title: 'Nelson Center Grants', description: 'Nelson Center for Entrepreneurship funding', link: 'https://entrepreneurship.brown.edu/', cta: 'Learn more' },
      { title: 'YC Application Guide', description: 'Tips and resources for applying to Y Combinator', link: 'https://www.ycombinator.com/apply/', cta: 'View' },
    ],
  },
  {
    category: 'Learning',
    items: [
      { title: 'Paul Graham Essays', description: 'Essential reading for builders', link: 'http://paulgraham.com/articles.html', cta: 'Read' },
      { title: 'Stripe Atlas Guides', description: 'Comprehensive startup guides', link: 'https://stripe.com/atlas/guides', cta: 'Read' },
    ],
  },
]

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verified')
    .eq('id', user.id)
    .single()

  if (!profile?.is_verified) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Resources</h1>
        <p className="text-sm text-zinc-400 mt-1">Curated for Builders Club members</p>
      </div>

      {RESOURCES.map(section => (
        <div key={section.category} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            {section.category}
          </h2>
          <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden">
            {section.items.map(item => (
              <div key={item.title} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.description}</p>
                </div>
                <a
                  href={item.link}
                  target={item.link.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-zinc-900 hover:underline shrink-0 ml-4"
                >
                  {item.cta} →
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
