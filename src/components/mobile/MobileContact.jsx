import { motion } from 'framer-motion'

const CONTACT = [
  { label: 'Email',   value: 'ferdousmikdad@gmail.com', href: 'mailto:ferdousmikdad@gmail.com' },
  { label: 'Phone',   value: '+880 1303 743 742',        href: 'tel:+8801303743742' },
]

const SOCIALS = [
  { label: 'LinkedIn',    href: 'https://www.linkedin.com/in/ferdousmikdad/' },
  { label: 'Instagram',   href: 'https://www.instagram.com/ferdousmikdad/' },
  { label: 'Facebook',    href: 'https://www.facebook.com/ferdousmikdad/' },
  { label: 'YouTube',     href: 'https://www.youtube.com/@ferdousmikdad' },
  { label: 'Behance',     href: 'https://www.behance.net/ferdousmikdad' },
  { label: 'Dribbble',    href: 'https://dribbble.com/ferdousmikdad/' },
  { label: 'Adobe Stock', href: 'https://stock.adobe.com/contributor/211436302/ferdous' },
  { label: 'Linktree',    href: 'https://linktr.ee/ferdousmikdad' },
]

export default function MobileContact() {
  return (
    <section id="m-contact" style={{ padding: '64px 20px 100px' }}>
      {/* Label */}
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--body)', opacity: 0.5, textTransform: 'uppercase' }}>
        Contact
      </p>
      <h2
        style={{
          margin: '0 0 8px',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--headline)',
          fontFamily: "'SF Pro Display', sans-serif",
        }}
      >
        Let's Work Together
      </h2>
      <p style={{ margin: '0 0 32px', fontSize: 14, color: 'var(--body)', opacity: 0.65, lineHeight: 1.65, maxWidth: 300 }}>
        Open to freelance projects, collaborations, and full-time creative roles.
      </p>

      {/* Contact info cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {CONTACT.map((c, i) => (
          <motion.a
            key={c.label}
            href={c.href}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 18px',
              background: 'var(--window-bg)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--body)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              {c.label}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--headline)', letterSpacing: '-0.01em' }}>
              {c.value}
            </span>
          </motion.a>
        ))}
      </div>

      {/* CTA button */}
      <a
        href="mailto:ferdousmikdad@gmail.com"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: 50,
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 700,
          background: 'var(--headline)',
          color: 'var(--bg)',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
          marginBottom: 32,
        }}
      >
        Send a Message
      </a>

      {/* Social links */}
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--body)', opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Find me on
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SOCIALS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="social-badge"
          >
            {s.label}
          </a>
        ))}
      </div>
    </section>
  )
}
