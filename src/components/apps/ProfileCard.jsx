import Window from '@/components/window/Window'
import mikdadPhoto from '@/assets/images/mikdad.jpg'

const socials = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/ferdousmikdad/' },
  { label: 'Instagram', href: 'https://www.instagram.com/ferdousmikdad/' },
  { label: 'Email',     href: 'mailto:ferdousmikdad@gmail.com' },
]

export default function ProfileCard() {
  return (
    <Window id="profile" actionLabel="Read more →">
      <div className="flex flex-col h-full">
        {/* Photo area */}
        <div className="relative flex-shrink-0 p-3">
          <img src={mikdadPhoto} alt="Mikdad" className="w-full h-auto rounded-lg" />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-5 pb-5 pt-3">
          <h2 className="text-headline font-display font-medium text-lg leading-tight" style={{ fontFamily: "'SF Pro Display'" }}>About me</h2>
          <p className="text-body text-[13px] mt-2 leading-relaxed" style={{ fontFamily: "'SF Pro Text'" }}>
            Designing digital experiences that blend creativity with usability.
            5+ years in branding, web…
          </p>

          {/* Social buttons */}
          <div className="flex gap-2 mt-auto pt-4 pb-6 flex-wrap">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="social-badge">{s.label}</a>
            ))}
          </div>
        </div>
      </div>
    </Window>
  )
}
