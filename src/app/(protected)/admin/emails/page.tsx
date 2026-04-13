import { createClient } from '@/lib/supabase/server'
import { CopyEmails } from '@/components/copy-emails'

export default async function AdminEmailsPage() {
  const supabase = await createClient()

  const { data: allMembers } = await supabase
    .from('profiles').select('email').eq('onboarding_complete', true).order('email')

  const { data: verifiedMembers } = await supabase
    .from('profiles').select('email').eq('is_verified', true).order('email')

  const { data: unverifiedMembers } = await supabase
    .from('profiles').select('email').eq('is_verified', false).eq('onboarding_complete', true).order('email')

  return (
    <>
      <p><b>Email Lists</b></p>
      <p style={{ fontSize: 12, color: '#828282' }}>Copy email addresses to paste into your email client.</p>
      <hr />

      <CopyEmails
        allEmails={allMembers?.map(m => m.email) ?? []}
        verifiedEmails={verifiedMembers?.map(m => m.email) ?? []}
        unverifiedEmails={unverifiedMembers?.map(m => m.email) ?? []}
      />
    </>
  )
}
