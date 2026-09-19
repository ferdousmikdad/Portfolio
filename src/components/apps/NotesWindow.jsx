import { useState } from 'react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import NotesPanel from '@/components/apps/NotesPanel'
import { CATEGORIES } from '@/data/notes.js'
import useWindowStore from '@/store/windowStore'

export default function NotesWindow() {
  const isMaximized = useWindowStore((s) => s.windows.find((w) => w.id === 'notes')?.isMaximized ?? false)

  const [activeCategory, setActiveCategory] = useState('all')

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={210} controls={{ onClose, onMinimize, onMaximize }}>

    {/* Navigation list */}
    <div className="flex flex-col overflow-y-auto window-scroll px-2 py-3 gap-0.5" style={{ flex: 1 }}>
      <p className="px-3 pb-1 text-[10px] font-semibold tracking-wide" style={{ color: '#5E5C53' }}>
        Categories
      </p>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`w-full flex items-center px-3 py-[5px] rounded-md text-left text-[12px] font-medium transition-colors
            ${activeCategory === cat.id ? 'bg-white/5 text-[#D0CDC4]' : 'text-[#5E5C53] hover:bg-white/5'}`}
          style={{ fontFamily: "'SF Pro Text'" }}
        >
          {cat.label}
        </button>
      ))}
    </div>
    </WindowSidebar>
  )

  return (
    <Window id="notes" title="Notes" sidebarContent={sidebarContent}>
      {/* The same body Finder shows under its Notes favourite. Only this
          mount answers note requests from the Terminal. */}
      <NotesPanel
        category={activeCategory}
        onCategoryChange={setActiveCategory}
        honorRequests
        wide={isMaximized}
      />
    </Window>
  )
}
