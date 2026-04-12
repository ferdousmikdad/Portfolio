import { ShoppingBag } from 'lucide-react'
import Window from '@/components/window/Window'

const configs = {
  shop: { Icon: ShoppingBag, label: 'Shop', desc: 'Design resources & templates' },
}

export default function ComingSoonWindow({ id }) {
  const cfg = configs[id]
  if (!cfg) return null
  const { Icon, label, desc } = cfg

  return (
    <Window id={id} title={label}>
      <div className="flex flex-col items-center justify-center h-full gap-3 pb-6">
        <Icon size={28} className="text-body" style={{ opacity: 0.3 }} />
        <div className="text-center">
          <h3
            className="text-headline text-sm font-medium"
            style={{ fontFamily: "'SF Pro Display'" }}
          >
            {label}
          </h3>
          <p className="text-body text-[11px] mt-1">{desc}</p>
        </div>
        <span
          className="text-body text-[10px] uppercase tracking-widest"
          style={{ opacity: 0.35, letterSpacing: '0.14em' }}
        >
          Coming Soon
        </span>
      </div>
    </Window>
  )
}
