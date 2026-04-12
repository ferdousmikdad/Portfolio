import { motion, AnimatePresence } from 'framer-motion'
import WindowControls from '@/components/window/WindowControls'
import HomeIcon      from '@/assets/icons/nav-home.svg?react'
import AboutIcon     from '@/assets/icons/nav-about.svg?react'
import PortfolioIcon from '@/assets/icons/nav-portfolio.svg?react'
import ShopIcon      from '@/assets/icons/nav-shop.svg?react'
import NotesIcon     from '@/assets/icons/nav-notes.svg?react'
import ToolsIcon     from '@/assets/icons/nav-tools.svg?react'

const menuItems = [
  { id: 'home',      label: 'Home',      icon: HomeIcon,      shortcut: 'Shift + H' },
  { id: 'about',     label: 'About me',  icon: AboutIcon,     shortcut: 'Shift + A' },
  { id: 'portfolio', label: 'Portfolio', icon: PortfolioIcon, shortcut: 'Shift + P' },
  { id: 'shop',      label: 'Shop',      icon: ShopIcon,      shortcut: 'Shift + S' },
  { id: 'notes',     label: 'Notes',     icon: NotesIcon,     shortcut: 'Shift + N' },
  { id: 'tools',     label: 'Tools',     icon: ToolsIcon,     shortcut: 'Shift + T' },
]

export default function MenuWindow({ isOpen, onClose, activeId, onNavigate, menuRef }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
        <div className="absolute bottom-24 left-0 right-0 flex justify-center z-50">
        <motion.div
          ref={menuRef}
          className="w-72 window-shell"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          {/* Title bar */}
          <div className="window-titlebar">
            <WindowControls onClose={onClose} onMinimize={onClose} onMaximize={() => {}} />
            <span className="ml-3 text-body text-xs">Use shortcut to access faster</span>
          </div>

          {/* Menu items */}
          <div className="py-1.5 px-2 flex flex-col gap-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose() }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-colors group
                    ${isActive
                      ? 'bg-white/5 text-headline'
                      : 'text-body hover:bg-white/5 hover:text-headline'
                    }`}
                >
                  <Icon
                    width={17}
                    height={17}
                    className={`flex-shrink-0 transition-colors ${isActive ? 'text-brand' : 'text-body group-hover:text-brand'}`}
                  />
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <span className="kbd-badge">{item.shortcut}</span>
                </button>
              )
            })}
          </div>
        </motion.div>
        </div>
      </>
      )}
    </AnimatePresence>
  )
}
