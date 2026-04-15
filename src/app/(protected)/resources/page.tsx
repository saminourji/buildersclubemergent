import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const RESOURCES = [
  { category: 'Community', items: [
    { title: 'Builders Club Slack', url: 'https://join.slack.com/t/thebuildersclubgroup/shared_invite/zt-3vflw9ksw-WJV~4ZXFRBA5UhMOKz81Fg', desc: 'Join the community workspace' },
    { title: 'Member Directory', url: '/directory', desc: 'Find collaborators and co-founders' },
  ]},
  { category: 'Funding', items: [
    { title: 'YC Application Guide', url: 'https://www.ycombinator.com/apply/', desc: 'How to apply to Y Combinator' },
  ]},
  { category: 'Reading', items: [
    { title: 'Paul Graham Essays', url: 'http://paulgraham.com/articles.html', desc: 'Essential reading for builders' },
    { title: 'Stripe Atlas Guides', url: 'https://stripe.com/atlas/guides', desc: 'Comprehensive startup guides' },
    { title: 'Outlier\u2019s Path', url: 'https://outlierspath.com/', desc: 'Essays and frameworks for building' },
  ]},
  { category: 'Emergent', items: [
    { title: 'Emergent Conference', url: 'https://emergentconference.org', desc: 'Our parent organization' },
  ]},
]

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('is_verified').eq('id', user.id).single()
  if (!profile?.is_verified) redirect('/dashboard')

  return (
    <>
      <p><b>Resources</b></p>
      <p style={{ fontSize: 12, color: '#828282' }}>Curated for Builders Club members.</p>
      <hr />

      {RESOURCES.map(section => (
        <div key={section.category} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>{section.category.toUpperCase()}</p>
          <ul style={{ paddingLeft: 20, listStyleType: 'disc' }}>
            {section.items.map(item => (
              <li key={item.title} style={{ marginBottom: 4 }}>
                <a href={item.url} target={item.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                  {item.title}
                </a>
                {' '}<span style={{ fontSize: 11, color: '#828282' }}>— {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
