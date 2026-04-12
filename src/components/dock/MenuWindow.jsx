import { motion, AnimatePresence } from 'framer-motion'
import { Home, User, Briefcase, ShoppingBag, FileText, Wrench } from 'lucide-react'
import WindowControls from '@/components/window/WindowControls'

const menuItems = [
  { id: 'home',      label: 'Home',      icon: Home,        shortcut: 'Shift + H' },
  { id: 'about',     label: 'About me',  icon: User,        shortcut: 'Shift + A' },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase,   shortcut: 'Shift + P' },
  { id: 'shop',      label: 'Shop',      icon: ShoppingBag, shortcut: 'Shift + S' },
  { id: 'notes',     label: 'Notes',     icon: FileText,    shortcut: 'Shift + N' },
  { id: 'tools',     label: 'Tools',     icon: Wrench,      shortcut: 'Shift + T' },
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
          <div className="py-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose() }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    ${isActive
                      ? 'bg-brand/15 text-headline'
                      : 'text-body hover:bg-white/5 hover:text-headline'
                    }`}
                >
                  <Icon size={17} className={isActive ? 'text-brand' : 'text-body'} />
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
