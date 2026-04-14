import { motion } from 'framer-motion'
import mikdadPhoto from '@/assets/images/mikdad.jpg'

const SOCIALS = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/ferdousmikdad/' },
  { label: 'Instagram', href: 'https://www.instagram.com/ferdousmikdad/' },
  { label: 'YouTube',   href: 'https://www.youtube.com/@ferdousmikdad' },
  { label: 'Behance',   href: 'https://www.behance.net/ferdousmikdad' },
  { label: 'Email',     href: 'mailto:ferdousmikdad@gmail.com' },
]

export default function MobileHero() {
  const scrollTo = (id) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px 60px',
        textAlign: 'center',
      }}
    >
      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ marginBottom: 24 }}
      >
        <img
          src={mikdadPhoto}
          alt="Ferdous Mikdad"
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid var(--border)',
          }}
        />
      </motion.div>

      {/* Name */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          margin: 0,
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: 'var(--headline)',
          fontFamily: "'SF Pro Display', sans-serif",
        }}
      >
        Ferdous Mikdad
      </motion.h1>

      {/* Role */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        style={{
          margin: '10px 0 0',
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--body)',
          letterSpacing: '-0.01em',
        }}
      >
        UI/UX Designer &amp; Web Developer
      </motion.p>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.5 }}
        style={{
          margin: '16px auto 0',
          maxWidth: 300,
          fontSize: 14,
          lineHeight: 1.65,
          color: 'var(--body)',
          opacity: 0.7,
        }}
      >
        Designing digital experiences that blend creativity with usability.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.5 }}
        style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <button
          onClick={() => scrollTo('#m-portfolio')}
          style={{
            height: 44,
            padding: '0 24px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            background: 'var(--headline)',
            color: 'var(--bg)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          View Portfolio
        </button>
        <a
          href="mailto:ferdousmikdad@gmail.com"
          style={{
            height: 44,
            padding: '0 24px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            background: 'transparent',
            color: 'var(--headline)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          Get in Touch
        </a>
      </motion.div>

      {/* Social badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.44, duration: 0.5 }}
        style={{ display: 'flex', gap: 8, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="social-badge"
          >
            {s.label}
          </a>
        ))}
      </motion.div>
    </section>
  )
}
