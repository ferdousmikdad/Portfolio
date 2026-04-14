import { motion, AnimatePresence } from 'framer-motion'
import HomeIcon      from '@/assets/icons/nav-home.svg?react'
import AboutIcon     from '@/assets/icons/nav-about.svg?react'
import PortfolioIcon from '@/assets/icons/nav-portfolio.svg?react'
import ToolsIcon     from '@/assets/icons/nav-tools.svg?react'

const MENU_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    Icon: HomeIcon,
  },
  {
    id: 'portfolio',
    label: 'Work',
    Icon: PortfolioIcon,
  },
  {
    id: 'about',
    label: 'About me',
    Icon: AboutIcon,
  },
  {
    id: 'tools',
    label: 'Tools',
    Icon: ToolsIcon,
  },
  {
    id: 'contact',
    label: 'Contact',
    // inline envelope — no nav-contact.svg exists
    Icon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <polyline points="2,4 12,13 22,4"/>
      </svg>
    ),
  },
]

const SOCIALS = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/ferdousmikdad/' },
  { label: 'Behance',   href: 'https://www.behance.net/ferdousmikdad' },
  { label: 'Dribbble',  href: 'https://dribbble.com/ferdousmikdad/' },
  { label: 'Instagram', href: 'https://www.instagram.com/ferdousmikdad/' },
  { label: 'YouTube',   href: 'https://www.youtube.com/@ferdousmikdad' },
]

export default function MobileMenu({ isOpen, onClose, activePage, onNav }) {
  const handleNav = (id) => {
    onNav(id)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 800,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Panel — slides up from bottom */}
          <motion.div
            key="menu-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            style={{
              position: 'fixed',
              left: 0, right: 0, bottom: 0,
              zIndex: 801,
              background: '#0d0d0d',
              borderRadius: '22px 22px 0 0',
              padding: '20px 20px 80px',
              maxHeight: '88svh',
              overflowY: 'auto',
            }}
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 28px' }} />

            {/* Name header */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
                Portfolio
              </p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f3f0e5', letterSpacing: '-0.02em', fontFamily: "'SF Pro Display', sans-serif" }}>
                Ferdous Mikdad
              </p>
            </div>

            {/* Nav items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 36 }}>
              {MENU_ITEMS.map(({ id, label, Icon }) => {
                const isActive = activePage === id
                return (
                  <button
                    key={id}
                    onClick={() => handleNav(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <Icon
                        width={17}
                        height={17}
                        style={{
                          flexShrink: 0,
                          color: isActive ? '#cf0506' : 'rgba(255,255,255,0.45)',
                        }}
                      />
                      <span style={{
                        fontSize: 16,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#f3f0e5' : 'rgba(255,255,255,0.65)',
                        fontFamily: "'SF Pro Display', sans-serif",
                        letterSpacing: '-0.01em',
                      }}>
                        {label}
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                )
              })}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 24 }} />

            {/* Social links */}
            <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>
              Find me on
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '6px 13px',
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.55)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    textDecoration: 'none',
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
