import Link from 'next/link'

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 760, margin: '60px auto', padding: '0 16px' }}>
      <table style={{ border: '1px solid #b0c4d8', width: '100%', background: '#fff' }}>
        <tbody>
          <tr>
            <td style={{ background: '#87CEEB', padding: '6px 10px', border: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo.png" alt="B" style={{ height: 22, width: 22, imageRendering: 'pixelated' }} />
              <b style={{ color: '#000' }}>Builders Club</b>
              <span style={{ fontSize: 9, color: '#fff', background: '#5BA3C9', padding: '1px 4px', fontWeight: 'bold', letterSpacing: 0.5 }}>BETA</span>
              <span style={{ marginLeft: 'auto', fontSize: 11 }}>
                <Link href="/">home</Link>
                {' · '}
                <Link href="/privacy">privacy</Link>
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '16px 20px', border: 'none' }}>
              <p><b>Terms of Service</b></p>
              <p style={{ fontSize: 11, color: '#828282', marginTop: 2 }}>
                Last updated: {new Date().toLocaleDateString('en-US')}
              </p>
              <hr />

              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                These Terms govern your use of the Builders Club member platform (“Platform”), run by Emergent.
                By using the Platform, you agree to these Terms.
              </p>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Who it’s for</b></p>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                The Platform is intended for Brown University students and alumni who participate in Builders Club.
              </p>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Acceptable use</b></p>
              <ul style={{ paddingLeft: 18, fontSize: 12, lineHeight: 1.7, marginTop: 6 }}>
                <li>Be respectful. Don’t harass, impersonate, or spam members.</li>
                <li>Provide accurate information in your profile and demo requests.</li>
                <li>Do not scrape the directory or attempt to export member data at scale.</li>
                <li>Do not attempt to bypass access controls or interfere with the Platform.</li>
              </ul>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Directory + resources</b></p>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                The member directory and some resources are gated until you attend at least one meeting.
                Access rules may change as the Platform evolves.
              </p>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Admin discretion</b></p>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                Admins may remove content, archive accounts, or revoke access to protect the community.
              </p>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Disclaimer</b></p>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                The Platform is provided “as is” without warranties. We may change or discontinue features at any time.
              </p>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Contact</b></p>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                Questions: <a href="mailto:buildersclub@emergentconference.org">buildersclub@emergentconference.org</a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

