import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import useWindowStore from '@/store/windowStore'
import useSound from '@/hooks/useSound'
import useTrashStore, { trashedFrom } from '@/store/trashStore'
import useThemeStore from '@/store/themeStore'
import useTrashDrag from '@/hooks/useTrashDrag'
import ContextMenu from '@/components/ui/ContextMenu'
import GlassLayers from '@/components/ui/LiquidGlass'
import MacAlert from '@/components/ui/MacAlert'
import TOOLS from '@/data/tools'

import spotifyIconUrl   from '@/assets/icons/spotify.svg?url'
/* Sidebar rows carry the real artwork, not the flat nav glyphs: Finder shows
   a place the way the place actually looks. Applications is the plain macOS
   folder, Portfolio the image folder, and the rest are the same app icons the
   dock uses, so one thing is never drawn two ways. */
import homeIconUrl      from '@/assets/icons/Home.png?url'
import portfolioIconUrl from '@/assets/icons/mac-folder-images.svg?url'
import notesIconUrl     from '@/assets/icons/note.png?url'
import shopIconUrl      from '@/assets/icons/App Store.png?url'
import toolsIconUrl     from '@/assets/icons/Folder.png?url'
import terminalAppIconUrl from '@/assets/icons/terminal.svg?url'
import pacmanIconUrl    from '@/assets/icons/magic-icon.svg?url'
import MacSearchIcon    from '@/assets/icons/macsearch.svg?react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import trashEmptyUrl     from '@/assets/icons/trash-empty.svg?url'
import trashFullUrl      from '@/assets/icons/trash-full.svg?url'
import trashEmptyDarkUrl from '@/assets/icons/trash-empty-dark.svg?url'
import trashFullDarkUrl  from '@/assets/icons/trash-full-dark.svg?url'

const NATIVE_APPS = [
  { id: 'terminal', label: 'Terminal',  icon: terminalAppIconUrl },
  { id: 'pacman',   label: 'Pac-Man',   icon: pacmanIconUrl },
  { id: 'spotify',  label: 'Spotify',   icon: spotifyIconUrl },
]

const FAVORITES = [
  { id: 'home',      label: 'Home',      icon: homeIconUrl },
  { id: 'portfolio', label: 'Portfolio', icon: portfolioIconUrl },
  { id: 'notes',     label: 'Notes',     icon: notesIconUrl },
  { id: 'shop',      label: 'Shop',      icon: shopIconUrl },
]

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors group
        ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
    >
      <img
        src={icon}
        alt={label}
        style={{ width: 15, height: 15, flexShrink: 0, objectFit: 'contain' }}
      />
      <span
        className="text-[13px] flex-1 truncate transition-colors"
        style={{
          fontFamily: "'SF Pro Text'",
          fontWeight: active ? 500 : 400,
          color: 'rgba(255, 255, 255, 0.94)',
        }}
      >
        {label}
      </span>
    </button>
  )
}

/* `thumb` draws the file as its own picture the way Finder previews an image,
   clipped to a rounded rect with a hairline, instead of a generic icon.
   `dragHandlers` is what makes a row draggable to the dock's Trash. */
function GridItem({
  icon, label, disabled, selected, thumb,
  onSingleClick, onDoubleClick, onContextMenu, dragHandlers,
}) {
  return (
    <button
      onClick={onSingleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      {...dragHandlers}
      className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150"
      style={{ background: 'transparent', border: '1px solid transparent', outline: 'none' }}
    >
      <div style={{
        width: 52, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 12,
        background: selected ? 'rgba(255,255,255,0.07)' : 'transparent',
        transition: 'background 0.12s',
      }}>
        <img
          src={icon}
          alt={label}
          draggable={false}
          style={thumb
            ? {
                width: 44, height: 44, objectFit: 'cover',
                borderRadius: 4,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.14), 0 1px 3px rgba(0,0,0,0.35)',
              }
            : {
                width: 40, height: 40, objectFit: 'contain',
                filter: disabled ? 'grayscale(0.6) opacity(0.4)' : 'none',
              }}
        />
      </div>
      <span
        className="text-[10px] text-center leading-tight px-1.5 py-0.5 rounded"
        style={{
          fontFamily:  "'SF Pro Text'",
          background:  selected ? '#0064d2' : 'transparent',
          color:       selected ? '#fff' : 'var(--body)',
          transition:  'background 0.12s, color 0.12s',
        }}
      >
        {label}
      </span>
    </button>
  )
}

/* An app being dragged out of the Applications grid. Split out so the drag
   hook gets its own component instance per row — hooks cannot live inside the
   map that renders them. */
function AppGridItem({ app, system, selected, onSelect, onOpen, onTrash, onBlocked }) {
  const { handlers, guard } = useTrashDrag(
    () => ({
      id:     `app-${app.id}`,
      name:   app.label,
      kind:   'application',
      icon:   app.icon,
      size:   '—',
      origin: { source: 'finder', id: app.id },
    }),
    {
      /* macOS refuses to trash what the system needs and says so, rather than
         quietly ignoring the drop. */
      onDrop: (item) => (system ? onBlocked(app) : onTrash(item)),
    },
  )

  return (
    <GridItem
      icon={app.icon}
      label={app.label}
      disabled={app.disabled}
      selected={selected}
      dragHandlers={handlers}
      onSingleClick={guard(onSelect)}
      onDoubleClick={guard(onOpen)}
    />
  )
}

export default function FinderWindow() {
  const { navigate, openTool, openWindow } = useWindowStore()
  const play = useSound()
  /* The location Finder is showing lives in the store, not here: the dock's
     basket points this window at the Trash, and that has to work whether the
     window was already open or not. 'applications' | 'trash' | favourite id */
  const contentView    = useWindowStore((st) => st.finderView)
  const setContentView = useWindowStore((st) => st.setFinderView)
  const [selectedTool,  setSelectedTool]  = useState(null)
  const [search,        setSearch]        = useState('')

  const isDark      = useThemeStore((st) => st.isDark)
  const trashItems  = useTrashStore((st) => st.items)
  const trashItem   = useTrashStore((st) => st.trashItem)
  const putBack     = useTrashStore((st) => st.putBack)
  const eraseItem   = useTrashStore((st) => st.eraseItem)
  const emptyTrash  = useTrashStore((st) => st.emptyTrash)

  const inTrash     = contentView === 'trash'
  const trashFull   = trashItems.length > 0
  const trashedApps = trashedFrom(trashItems, 'finder')

  const trashIcon = trashFull
    ? (isDark ? trashFullDarkUrl  : trashFullUrl)
    : (isDark ? trashEmptyDarkUrl : trashEmptyUrl)

  const [itemMenu,     setItemMenu]     = useState(null)   // { x, y, id }
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [blockedApp,   setBlockedApp]   = useState(null)

  // Selection belongs to a location — switching away from the Trash should
  // not leave a trashed file highlighted behind the Applications grid.
  useEffect(() => { setSelectedTool(null) }, [contentView])

  const visibleTools = useMemo(() => {
    // An app in the Trash is not installed, so it is not in the grid either.
    const installed = TOOLS.filter((t) => !trashedApps.has(t.id))
    if (!search.trim()) return installed
    const q = search.toLowerCase()
    return installed.filter((t) => t.name.toLowerCase().includes(q))
  }, [search, trashItems])

  const visibleNativeApps = NATIVE_APPS.filter((a) => !trashedApps.has(a.id))

  const doEmptyTrash = () => { play('emptyTrash'); emptyTrash(); setConfirmEmpty(false); setSelectedTool(null) }

  const doPutBack = (id) => { play('open'); putBack(id); setSelectedTool(null) }

  const trashApp = useCallback((item) => { play('trash'); trashItem(item) }, [play, trashItem])

  const currentPage = contentView !== 'applications' && !inTrash
    ? FAVORITES.find((f) => f.id === contentView)
    : null

  /* The name of the location, shown twice the way Finder shows it: once in
     the toolbar beside the arrows, once as the heading of the file area. */
  const locationName = inTrash
    ? 'Trash'
    : contentView === 'applications'
      ? 'Applications'
      : currentPage?.label ?? ''

  /* ── Back / forward ─────────────────────────────────────────────────────
     Real arrows over a real history, dimmed when there is nowhere to go —
     which is how the pair looks most of the time in a fresh Trash window.
     The location itself lives in the store, because the dock can change it
     from outside; `jumping` marks the changes this pair caused, so stepping
     back does not itself get recorded as a step. */
  const [past,   setPast]   = useState([])
  const [future, setFuture] = useState([])
  const jumping  = useRef(false)
  const lastView = useRef(contentView)

  useEffect(() => {
    if (lastView.current === contentView) return
    // Read into a local first: a state updater runs on the next render, by
    // which time the ref below has already been reassigned — passing the ref
    // straight in records the location just arrived at instead of the one
    // being left, and Back then goes nowhere.
    const from = lastView.current
    lastView.current = contentView
    if (jumping.current) jumping.current = false
    else { setPast((p) => [...p, from]); setFuture([]) }
  }, [contentView])

  const goBack = () => {
    if (!past.length) return
    jumping.current = true
    setFuture((f) => [contentView, ...f])
    setPast((p) => p.slice(0, -1))
    setContentView(past[past.length - 1])
  }

  const goForward = () => {
    if (!future.length) return
    jumping.current = true
    setPast((p) => [...p, contentView])
    setFuture((f) => f.slice(1))
    setContentView(future[0])
  }

  /* ── Toolbar, left side ──────────────────────────────────────────────────
     Arrows, then the window name right beside them — Finder does not centre
     its title. Everything else lives on the right. */
  const navSlot = (
    <div className="finder-nav">
      <div className="finder-arrows finder-glass">
        <GlassLayers small />
        <button
          aria-label="Back"
          disabled={!past.length}
          onClick={goBack}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ChevronLeft size={28} strokeWidth={1.7} />
        </button>
        <span className="finder-arrows__sep" />
        <button
          aria-label="Forward"
          disabled={!future.length}
          onClick={goForward}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ChevronRight size={28} strokeWidth={1.7} />
        </button>
      </div>
      <span className="finder-nav__title">{locationName}</span>
    </div>
  )

  const launchTool = (toolId) => {
    play('open')
    openTool(toolId)
  }

  const launchPage = (pageId) => {
    play('open')
    navigate(pageId)
  }

  const goToApplications = () => {
    setContentView('applications')
    setSelectedTool(null)
    setSearch('')
  }

  // ── Toolbar ──────────────────────────────────────────────────────────────────
  /* Toolbar, right side. Finder keeps only view and search controls here —
     Empty belongs to the row below, and Put Back is a menu item, not a
     button, so neither appears in the chrome. */
  const toolbar = (
    <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
      <div className="finder-search finder-glass">
        <GlassLayers small />
        <MacSearchIcon width={11} height={11} style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedTool(null); setContentView('applications') }}
          placeholder={inTrash ? 'Search' : 'Search tools…'}
          className="bg-transparent text-[11px] outline-none w-full"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={200} controls={{ onClose, onMinimize, onMaximize }}>
    <div className="flex flex-col overflow-y-auto window-scroll px-2 py-2 gap-0.5" style={{ flex: 1 }}>
      {/* Applications — top entry */}
      <SidebarItem
        icon={toolsIconUrl}
        label="Applications"
        active={contentView === 'applications'}
        onClick={goToApplications}
      />

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 8px' }} />

      {/* Favorites */}
      <p className="px-3 pb-1 text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.56)' }}>Favorites</p>
      {FAVORITES.map((fav) => (
        <SidebarItem
          key={fav.id}
          icon={fav.icon}
          label={fav.label}
          active={contentView === fav.id}
          onClick={() => { setContentView(fav.id); setSelectedTool(null); setSearch('') }}
        />
      ))}

      {/* Locations — the Trash is a place in Finder, not an app of its own,
          which is why the dock's basket opens this window. */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 8px' }} />
      <p className="px-3 pb-1 text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.56)' }}>Locations</p>
      <SidebarItem
        icon={trashIcon}
        label="Trash"
        active={inTrash}
        onClick={() => { setContentView('trash'); setSelectedTool(null); setSearch('') }}
      />
    </div>
    </WindowSidebar>
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Window
      id="finder"
      navSlot={navSlot}
      toolbar={toolbar}
      sidebarContent={sidebarContent}
      titleBarBorder={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* The row under the toolbar: the location on the left, and in the
            Trash the one button it gets — Empty, dimmed when it is empty. */}
        <div className="finder-subbar">
          <span className="finder-subbar__name">{locationName}</span>
          {inTrash && (
            <button
              className="finder-empty-btn"
              disabled={!trashFull}
              onClick={() => setConfirmEmpty(true)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              Empty
            </button>
          )}
        </div>

      <div className="window-scroll px-4 pb-4 pt-1" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <AnimatePresence mode="wait">

          {contentView === 'applications' ? (
            /* ── Applications grid — single click selects, double click opens ── */
            <motion.div
              key="applications"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Native apps (Terminal etc.) — always shown, not affected by search */}
              {!search.trim() && (
                <section className="mb-4">
                  <p className="text-[10px] font-semibold tracking-widest mb-3 px-1" style={{ color: '#5E5C53' }}>SYSTEM</p>
                  <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))' }}>
                    {visibleNativeApps.map((app) => (
                      <AppGridItem
                        key={app.id}
                        app={app}
                        system
                        selected={selectedTool === app.id}
                        onSelect={() => setSelectedTool(app.id)}
                        onOpen={() => { play('open'); openWindow(app.id) }}
                        onTrash={trashApp}
                        onBlocked={setBlockedApp}
                      />
                    ))}
                  </div>
                </section>
              )}

              {visibleTools.length > 0 ? (
                <section>
                  <p className="text-[10px] font-semibold tracking-widest mb-3 px-1" style={{ color: '#5E5C53' }}>
                    APPLICATIONS — {visibleTools.length}
                  </p>
                  <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))' }}>
                    {visibleTools.map((tool) => (
                      <AppGridItem
                        key={tool.id}
                        app={{ id: tool.id, label: tool.name, icon: tool.icon, disabled: tool.url === null }}
                        selected={selectedTool === tool.id}
                        onSelect={() => setSelectedTool(tool.id)}
                        onOpen={() => tool.url && launchTool(tool.id)}
                        onTrash={trashApp}
                        onBlocked={setBlockedApp}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2" style={{ paddingTop: 80 }}>
                  <MacSearchIcon width={28} height={28} style={{ opacity: 0.2 }} />
                  <p className="text-[12px]" style={{ color: 'var(--body)', opacity: 0.5 }}>No tools found</p>
                </div>
              )}
            </motion.div>

          ) : inTrash ? (
            /* ── Trash ────────────────────────────────────────────────────
               The folder itself. Right-click gives the two things macOS
               gives you here — Put Back and Delete Immediately — and the
               footer restates what emptying means, the way the real window
               does above its file list. */
            <motion.div
              key="trash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ minHeight: 'calc(100% - 32px)' }}
              onClick={() => setSelectedTool(null)}
            >
              {trashFull ? (
                  <div className="grid gap-1 pt-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))' }}>
                    {trashItems.map((item) => (
                      <GridItem
                        key={item.id}
                        icon={item.icon}
                        label={item.name}
                        thumb={item.kind === 'image'}
                        selected={selectedTool === item.id}
                        onSingleClick={(e) => { e.stopPropagation(); setSelectedTool(item.id) }}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          setSelectedTool(item.id)
                          setItemMenu({ x: e.clientX, y: e.clientY, id: item.id })
                        }}
                      />
                    ))}
                  </div>
              ) : (
                /* macOS states this in the middle of the window, in grey */
                <div className="flex flex-col items-center justify-center gap-3" style={{ paddingTop: 96 }}>
                  <img src={trashIcon} alt="" draggable={false} style={{ width: 52, height: 52, opacity: 0.45 }} />
                  <p className="text-[13px] font-medium" style={{ color: 'var(--headline)', opacity: 0.7, fontFamily: "'SF Pro Text'" }}>
                    Trash is Empty
                  </p>
                  <p className="text-[11px] text-center max-w-[260px]" style={{ color: 'var(--body)', opacity: 0.45 }}>
                    Drag a file from the desktop, or an app from Applications, onto the
                    Trash in the dock.
                  </p>
                </div>
              )}
            </motion.div>

          ) : (
            /* ── Page / Favorite detail ── */
            <motion.div
              key={contentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-center justify-center gap-5"
              style={{ minHeight: 'calc(100% - 32px)' }}
            >
              <motion.img
                src={currentPage?.icon}
                alt={currentPage?.label}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                style={{ width: 88, height: 88, objectFit: 'contain' }}
              />
              <div className="text-center">
                <p className="text-[20px] font-semibold" style={{ color: 'var(--headline)', fontFamily: "'SF Pro Display'" }}>
                  {currentPage?.label}
                </p>
                <p className="text-[12px] mt-1.5" style={{ color: 'var(--body)', opacity: 0.7 }}>
                  Navigate to this page
                </p>
              </div>
              <button
                onClick={() => launchPage(contentView)}
                className="px-6 py-2 rounded-lg text-[12px] font-medium"
                style={{ background: 'rgba(207,5,6,0.12)', border: '1px solid rgba(207,5,6,0.28)', color: '#cf0506', fontFamily: "'SF Pro Text'" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,5,6,0.22)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(207,5,6,0.12)' }}
              >
                Open
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      </div>

      {/* Right-click a trashed file */}
      <ContextMenu
        at={itemMenu}
        onClose={() => setItemMenu(null)}
        items={[
          {
            label: 'Put Back',
            /* Seeded demo files have no origin to go back to, which is exactly
               what macOS does with a file whose original folder is gone. */
            disabled: !trashItems.find((i) => i.id === itemMenu?.id)?.origin,
            onClick: () => doPutBack(itemMenu.id),
          },
          { sep: true },
          {
            label: 'Delete Immediately',
            onClick: () => { play('emptyTrash'); eraseItem(itemMenu.id); setSelectedTool(null) },
          },
        ]}
      />

      <MacAlert
        open={confirmEmpty}
        icon={trashIcon}
        title="Are you sure you want to permanently erase the items in the Trash?"
        message="You can't undo this action."
        confirmLabel="Empty Trash"
        onConfirm={doEmptyTrash}
        onCancel={() => setConfirmEmpty(false)}
      />

      {/* Dropping a required app on the Trash: macOS refuses out loud */}
      <MacAlert
        open={Boolean(blockedApp)}
        icon={blockedApp?.icon}
        title={`“${blockedApp?.label}” can't be modified or deleted because it's required by macOS.`}
        cancelLabel={null}
        confirmLabel="OK"
        onConfirm={() => setBlockedApp(null)}
        onCancel={() => setBlockedApp(null)}
      />
    </Window>
  )
}
