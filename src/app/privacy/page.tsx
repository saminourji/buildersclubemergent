import Link from 'next/link'

export default function PrivacyPage() {
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
                <Link href="/terms">terms</Link>
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '16px 20px', border: 'none' }}>
              <p><b>Privacy Policy</b></p>
              <p style={{ fontSize: 11, color: '#828282', marginTop: 2 }}>
                Last updated: {new Date().toLocaleDateString('en-US')}
              </p>
              <hr />

              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                This is the privacy policy for the Builders Club member platform (“Platform”), run by Emergent.
                The Platform is intended for Brown University students and alumni using Google sign-in.
              </p>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Information we collect</b></p>
              <ul style={{ paddingLeft: 18, fontSize: 12, lineHeight: 1.7, marginTop: 6 }}>
                <li><b>Account info</b>: your email address and basic profile info provided by Google sign-in.</li>
                <li><b>Profile info you submit</b>: name, class year, concentration, interests, skills, build stage, project name/URL, phone (optional), and resource preferences.</li>
                <li><b>Meeting attendance</b>: check-ins for meetings you attend (including retroactive attendance marked by admins).</li>
                <li><b>Demo requests</b>: requests you submit to present at a meeting.</li>
              </ul>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>How we use information</b></p>
              <ul style={{ paddingLeft: 18, fontSize: 12, lineHeight: 1.7, marginTop: 6 }}>
                <li>To operate the Platform: sign-in, profile, meetings, attendance, and demo requests.</li>
                <li>To help members find each other for collaboration (directory).</li>
                <li>To manage access to member-only resources (gated until you attend at least one meeting).</li>
              </ul>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Directory + resource access</b></p>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                The member directory and some resources are only available after you attend at least one meeting.
                This gate exists to keep the directory focused on people who actually show up.
              </p>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Sharing and disclosure</b></p>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                Your directory profile is visible to verified members (after they attend at least one meeting).
                We do not sell personal data. We may share information with service providers that run the Platform
                (for example hosting and authentication providers) only as needed to provide the service.
              </p>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Data retention</b></p>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                We keep your information while your account remains active. Admins may archive accounts.
              </p>

              <p style={{ fontSize: 12, marginTop: 12 }}><b>Contact</b></p>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                Questions or deletion requests: <a href="mailto:buildersclub@emergentconference.org">buildersclub@emergentconference.org</a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

