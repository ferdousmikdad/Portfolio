import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import ChatPanel from '@/components/apps/ChatPanel'
import mikdadPhoto from '@/assets/images/mikdad.jpg'
import { CONTACT } from '@/data/mikudaAI'

// ── Sidebar social links ──────────────────────────────────────────────────────

const SIDEBAR_SOCIALS = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/ferdousmikdad/', icon: 'in', color: '#0A66C2' },
  { label: 'Behance',   href: 'https://www.behance.net/ferdousmikdad',       icon: 'Bē', color: '#1769FF' },
  { label: 'Dribbble',  href: 'https://dribbble.com/ferdousmikdad/',         icon: '◉',  color: '#EA4C89' },
  { label: 'Instagram', href: 'https://www.instagram.com/ferdousmikdad/',   icon: '✦',  color: '#E1306C' },
]

// ── Main export ───────────────────────────────────────────────────────────────

export default function HomeWindow() {
  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={220} gutter="6px 0 6px 6px" controls={{ onClose, onMinimize, onMaximize }}>

    {/* Profile content */}
    <div className="hw-sidebar-scroll">
      <img src={mikdadPhoto} alt="Mikdad" className="hw-profile-photo" draggable={false} />

      <p className="hw-profile-name">Ferdous Mikdad</p>
      <p className="hw-profile-role">UI/UX Designer &amp; Web Developer</p>

      <span className="hw-available-badge">
        <span className="hw-available-dot" />
        Available for projects
      </span>

      <div className="hw-sidebar-divider" />

      <p className="hw-sidebar-bio">
        Designing digital experiences that blend creativity with usability. 5+ years in branding, web design, and creative development.
      </p>

      <div className="hw-social-links">
        {SIDEBAR_SOCIALS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hw-social-icon-btn" title={s.label}
            style={{ background: `${s.color}18`, color: s.color }}>
            {s.icon}
          </a>
        ))}
        <a href={`mailto:${CONTACT.email}`} className="hw-social-icon-btn" title="Email me"
          style={{ background: 'rgba(207,5,6,0.12)', color: '#cf0506' }}>
          ✉
        </a>
      </div>
    </div>
    </WindowSidebar>
  )

  return (
    <Window id="home" title="Mikuda" sidebarContent={sidebarContent} hideTitleBar={false}>
      <ChatPanel />
    </Window>
  )
}
