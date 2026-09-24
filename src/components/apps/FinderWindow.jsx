import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import useWindowStore from '@/store/windowStore'
import useSound from '@/hooks/useSound'
import useTrashStore, { trashedFrom } from '@/store/trashStore'
import useThemeStore from '@/store/themeStore'
import useTrashDrag from '@/hooks/useTrashDrag'
import useDesktopStore from '@/store/desktopStore'
import useDesktopItems, { DESKTOP_PATH } from '@/hooks/useDesktopItems'
import ContextMenu from '@/components/ui/ContextMenu'
import SFSymbol from '@/components/ui/SFSymbol'
import ChatPanel from '@/components/apps/ChatPanel'
import PortfolioPanel from '@/components/apps/PortfolioPanel'
import NotesPanel from '@/components/apps/NotesPanel'
import ShopPanel from '@/components/apps/ShopPanel'
import FinderBrowser, { IconTile } from '@/components/apps/FinderBrowser'
import { SHOP_CATEGORIES } from '@/data/stickResources'
import { CATEGORIES, TAGS } from '@/data/projects'
import { CATEGORIES as NOTE_CATEGORIES } from '@/data/notes.js'
import GlassLayers from '@/components/ui/LiquidGlass'
import MacAlert from '@/components/ui/MacAlert'
import TOOLS from '@/data/tools'

import spotifyIconUrl    from '@/assets/icons/spotify.svg?url'
import terminalAppIconUrl from '@/assets/icons/terminal.svg?url'
import pacmanIconUrl     from '@/assets/icons/magic-icon.svg?url'
import calculatorIconUrl from '@/assets/icons/Calculator@4x 1.png?url'
import settingsIconUrl   from '@/assets/icons/mac-system-settings.svg?url'
import photoBoothIconUrl from '@/assets/icons/photobooth.png?url'
import trashEmptyUrl     from '@/assets/icons/trash-empty.svg?url'
import trashFullUrl      from '@/assets/icons/trash-full.svg?url'
import trashEmptyDarkUrl from '@/assets/icons/trash-empty-dark.svg?url'
import trashFullDarkUrl  from '@/assets/icons/trash-full-dark.svg?url'

/* ── Finder ──────────────────────────────────────────────────────────────────
   Drawn to Tahoe's Finder, measured off the real window at 2x:

   Sidebar  Recents at the top, then Favorites, Locations and Tags. Rows are
            a label-coloured outline SF Symbol and a 13pt name; the selected
            row is a soft grey slab with its symbol and name in the accent.
            No disclosure chevrons. Portfolio, Notes and Store still show
            their sections under them while you are inside, indented.
   Toolbar  four glass capsules — back/forward, the view switcher (icons ·
            list · columns · gallery), Group ▾, then Share · Tags · ⋯ — and
            a round search button that opens into a field.

   Every file location (Applications, Desktop, Recents, a tag, the Trash, a
   folder you made) is drawn by FinderBrowser, so the view switcher, Group
   and search work the same in all of them. Home, Portfolio, Notes and Store
   hold the real thing instead: the chat, the project wall, the notes and
   the shelf.                                                              */

const NATIVE_APPS = [
  { id: 'terminal',    label: 'Terminal',        icon: terminalAppIconUrl },
  { id: 'pacman',      label: 'Pac-Man',         icon: pacmanIconUrl },
  { id: 'spotify',     label: 'Spotify',         icon: spotifyIconUrl },
  { id: 'calculator',  label: 'Calculator',      icon: calculatorIconUrl },
  { id: 'settings',    label: 'System Settings', icon: settingsIconUrl },
  { id: 'photo-booth', label: 'Photo Booth',     icon: photoBoothIconUrl },
]

const FAVORITES = [
  { id: 'applications', label: 'Applications', symbol: 'appstore' },
  { id: 'desktop',      label: 'Desktop',      symbol: 'menubar.dock.rectangle' },
  { id: 'home',         label: 'Home',         symbol: 'house' },
  { id: 'portfolio',    label: 'Portfolio',    symbol: 'photo.on.rectangle' },
  { id: 'notes',        label: 'Notes',        symbol: 'note.text' },
  { id: 'shop',         label: 'Store',        symbol: 'bag' },
]

const CATEGORY_SYMBOLS = {
  'logo':           'seal',
  'arabic-logo':    'character.book.closed',
  'brand-identity': 'paintpalette',
  'landing-pages':  'macwindow',
  'dashboards':     'chart.bar.xaxis',
  'mobile-ui':      'iphone',
}

const VIEWS = [
  { id: 'icons',   symbol: 'square.grid.2x2',                    label: 'as Icons' },
  { id: 'list',    symbol: 'list.bullet',                        label: 'as List' },
  { id: 'columns', symbol: 'rectangle.split.3x1',                label: 'as Columns' },
  { id: 'gallery', symbol: 'rectangle.bottomthird.inset.filled', label: 'as Gallery' },
]

const GROUPS = [
  ['none', 'None'],
  ['name', 'Name'],
  ['kind', 'Kind'],
  ['tags', 'Tags'],
]

/* One sidebar row. `symbol` is an SF Symbol, `dot` a tag colour. */
function Row({ symbol, dot, label, active, onClick, indent }) {
  return (
    <button className="fd-row" data-on={active || undefined} data-indent={indent || undefined} onClick={onClick}>
      {dot
        ? <span className="fd-row__dot" style={{ background: dot }} />
        : <SFSymbol name={symbol} size={indent ? 13 : 15} className="fd-row__icon" />}
      <span className="fd-row__label">{label}</span>
    </button>
  )
}

/* An app tile in the icon view, draggable to the dock's Trash. Split out so
   the drag hook has a component instance per tile. */
function AppTile({ app, props, onTrash, onBlocked }) {
  const { handlers, guard } = useTrashDrag(
    () => ({
      id: `app-${app.id}`, name: app.label, kind: 'application', icon: app.icon, size: '—',
      origin: { source: 'finder', id: app.id },
    }),
    // macOS refuses to trash what the system needs, and says so.
    { onDrop: (item) => (app.system ? onBlocked(app) : onTrash(item)) },
  )
  return (
    <IconTile
      {...props}
      dragHandlers={handlers}
      onSelect={guard(props.onSelect)}
      onOpen={guard(props.onOpen)}
    />
  )
}

export default function FinderWindow() {
  const { navigate, openTool, openWindow, startAirDrop } = useWindowStore()
  const play = useSound()
  /* The location lives in the store, not here: the dock's basket and the
     desktop's folders point this window somewhere from outside. */
  const contentView    = useWindowStore((st) => st.finderView)
  const setContentView = useWindowStore((st) => st.setFinderView)

  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [view,     setView]     = useState('icons')
  const [group,    setGroup]    = useState('none')
  const [menu,     setMenu]     = useState(null)   // { at, items }

  const [pfType, setPfType] = useState(null)
  const [pfItem, setPfItem] = useState(null)
  const [pfView, setPfView] = useState('grid')
  const [noteCat, setNoteCat] = useState('all')
  const [shopCat, setShopCat] = useState(null)
  /* Which of Portfolio / Notes / Store have their sections unfolded. The
     first click on one goes there and unfolds it; clicking it again while
     you are there folds it away, and again brings it back. */
  const [unfolded, setUnfolded] = useState(() => new Set())
  const EXPANDABLE = ['portfolio', 'notes', 'shop']
  const clickFav = (id) => {
    if (EXPANDABLE.includes(id)) {
      setUnfolded((prev) => {
        const next = new Set(prev)
        if (contentView === id && next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }
    if (contentView !== id) go(id)
  }

  const isDark      = useThemeStore((st) => st.isDark)
  const trashItems  = useTrashStore((st) => st.items)
  const trashItem   = useTrashStore((st) => st.trashItem)
  const putBack     = useTrashStore((st) => st.putBack)
  const eraseItem   = useTrashStore((st) => st.eraseItem)
  const emptyTrash  = useTrashStore((st) => st.emptyTrash)

  const desktopItems = useDesktopItems()
  const recent       = useDesktopStore((st) => st.recent)
  const toggleTag    = useDesktopStore((st) => st.toggleTag)
  const newFolder    = useDesktopStore((st) => st.newFolder)
  const showInfo     = useDesktopStore((st) => st.showInfo)

  const inTrash     = contentView === 'trash'
  const folderId    = contentView?.startsWith?.('folder:') ? contentView.slice(7) : null
  const tagId       = contentView?.startsWith?.('tag:') ? contentView.slice(4) : null
  const isHome      = contentView === 'home'
  const isPortfolio = contentView === 'portfolio'
  const isNotes     = contentView === 'notes'
  const isShop      = contentView === 'shop'
  const isEmbedded  = isHome || isPortfolio || isNotes || isShop
  const trashFull   = trashItems.length > 0
  const trashedApps = trashedFrom(trashItems, 'finder')

  const trashIcon = trashFull
    ? (isDark ? trashFullDarkUrl  : trashFullUrl)
    : (isDark ? trashEmptyDarkUrl : trashEmptyUrl)

  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [blockedApp,   setBlockedApp]   = useState(null)

  // Selection belongs to a location.
  useEffect(() => { setSelected(null) }, [contentView])

  const launchTool = (id) => { play('open'); openTool(id) }
  const trashApp = useCallback((item) => { play('trash'); trashItem(item) }, [play, trashItem])

  /* ── The items of each file location, in FinderBrowser's shape ── */

  const apps = useMemo(() => [
    ...NATIVE_APPS.map((a) => ({ ...a, system: true })),
    ...TOOLS.map((t) => ({ id: t.id, label: t.name, icon: t.icon, disabled: t.url === null })),
  ]
    .filter((a) => !trashedApps.has(a.id))
    .map((a) => ({
      ...a,
      kind: 'application',
      size: '—',
      onOpen: () => (a.system ? (play('open'), openWindow(a.id)) : launchTool(a.id)),
      trash: a.system ? null : { id: `app-${a.id}`, name: a.label, kind: 'application', icon: a.icon, size: '—', origin: { source: 'finder', id: a.id } },
      where: 'Macintosh HD ▸ Applications',
    })), [trashItems])

  const fromDesktop = (f) => ({
    id: f.id,
    label: f.name,
    icon: f.icon,
    kind: f.kind,
    size: f.size,
    date: f.addedAt,
    tags: f.tags,
    desktopId: f.id,
    where: DESKTOP_PATH,
    onOpen: () => (f.kind === 'folder' ? setContentView(`folder:${f.id}`) : (play('open'), openWindow(f.windowId))),
    trash: { id: f.id, name: f.name, kind: f.kind, icon: f.icon, size: f.size, origin: { source: 'desktop', id: f.id } },
  })

  const items = useMemo(() => {
    let list = []
    if (contentView === 'applications') list = apps
    else if (contentView === 'desktop') list = desktopItems.map(fromDesktop)
    else if (tagId) list = desktopItems.filter((f) => f.tags.includes(tagId)).map(fromDesktop)
    else if (contentView === 'recents') {
      list = recent.map((r) => {
        const file = desktopItems.find((f) => f.windowId === r.id)
        if (file) return fromDesktop(file)
        const app = apps.find((a) => a.id === r.id)
        return app ?? { id: r.id, label: r.name, icon: r.icon, kind: 'application', size: '—', onOpen: () => openWindow(r.id) }
      })
    } else if (inTrash) {
      list = trashItems.map((t) => ({
        id: t.id, label: t.name, icon: t.icon, kind: t.kind, size: t.size, date: t.deletedAt,
        thumb: t.kind === 'image', inTrash: true, where: 'Trash',
      }))
    }
    const q = search.trim().toLowerCase()
    return q ? list.filter((i) => i.label.toLowerCase().includes(q)) : list
  }, [contentView, apps, desktopItems, recent, trashItems, search, tagId, inTrash])

  const isFiles = !isEmbedded
  const current = items.find((i) => i.id === selected)
  const canTag  = !!current?.desktopId

  /* ── Actions on the selection ── */

  const info = (it) => showInfo({
    name: it.label, kind: it.kind, icon: it.icon, size: it.size, tags: it.tags,
    where: it.where ?? DESKTOP_PATH, created: it.date, modified: it.date,
  })

  const itemMenu = (it) => it.inTrash
    ? [
        { label: 'Put Back', icon: 'arrow.uturn.backward',
          disabled: !trashItems.find((t) => t.id === it.id)?.origin,
          onClick: () => { play('open'); putBack(it.id); setSelected(null) } },
        { sep: true },
        { label: 'Delete Immediately…', icon: 'xmark.circle',
          onClick: () => { play('emptyTrash'); eraseItem(it.id); setSelected(null) } },
      ]
    : [
        { label: 'Open', icon: 'arrow.up.right.square', shortcut: '⌘O', disabled: it.disabled, onClick: () => it.onOpen?.() },
        { sep: true },
        { label: 'Move to Trash', icon: 'trash', shortcut: '⌘⌫',
          disabled: !it.trash,
          onClick: () => { play('trash'); trashItem(it.trash); setSelected(null) } },
        { sep: true },
        { label: 'Get Info', icon: 'info.circle', shortcut: '⌘I', onClick: () => info(it) },
        { sep: true },
        { label: 'Share…', icon: 'square.and.arrow.up', onClick: () => { play('open'); startAirDrop() } },
        ...(it.desktopId ? [{ sep: true }, { tags: TAGS, selected: it.tags, onToggle: (t) => toggleTag(it.desktopId, t) }] : []),
      ]

  const openMenu = (e, items) => {
    const r = e.currentTarget.getBoundingClientRect()
    setMenu({ at: { x: Math.round(r.left), y: Math.round(r.bottom + 6) }, items })
  }

  /* ── Back / forward over a real history ── */
  const [past,   setPast]   = useState([])
  const [future, setFuture] = useState([])
  const jumping  = useRef(false)
  const lastView = useRef(contentView)

  useEffect(() => {
    if (lastView.current === contentView) return
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

  const folderName = useDesktopStore((st) => folderId ? (st.names[folderId] ?? st.folders.find((x) => x.id === folderId)?.name) : null)
  const locationName =
    inTrash ? 'Trash'
    : folderId ? (folderName ?? 'untitled folder')
    : tagId ? TAGS.find((t) => t.id === tagId)?.label
    : contentView === 'recents' ? 'Recents'
    : FAVORITES.find((f) => f.id === contentView)?.label ?? ''

  const go = (id) => { setContentView(id); setSearch(''); setSearchOpen(false) }

  const stop = (e) => e.stopPropagation()

  /* ── Toolbar ── */

  const navSlot = (
    <div className="finder-nav">
      <div className="finder-arrows finder-glass">
        <GlassLayers small />
        <button aria-label="Back" disabled={!past.length} onClick={goBack} onPointerDown={stop}>
          <SFSymbol name="chevron.left" size={15} />
        </button>
        <span className="finder-arrows__sep" />
        <button aria-label="Forward" disabled={!future.length} onClick={goForward} onPointerDown={stop}>
          <SFSymbol name="chevron.right" size={15} />
        </button>
      </div>
      <span className="finder-nav__title">{locationName}</span>
    </div>
  )

  /* The Portfolio wall has its own grid and list; the other embedded
     places have no view to switch, so the switcher dims there. */
  const viewFor = (id) => (isPortfolio ? (id === 'list' ? 'list' : 'grid') : id)
  const activeView = isPortfolio ? (pfView === 'list' ? 'list' : 'icons') : view
  const viewEnabled = (id) => isFiles || (isPortfolio && (id === 'icons' || id === 'list'))

  const toolbar = (
    <div className="fd-tools" onPointerDown={stop}>
      <div className="fd-cap finder-glass">
        <GlassLayers small />
        {VIEWS.map((v, i) => (
          <span key={v.id} className="fd-cap__slot">
            {i === 2 && <span className="fd-cap__sep" />}
            <button
              className="fd-btn"
              data-on={activeView === v.id || undefined}
              disabled={!viewEnabled(v.id)}
              title={`View ${v.label}`}
              onClick={() => (isPortfolio ? setPfView(viewFor(v.id)) : setView(v.id))}
            >
              <SFSymbol name={v.symbol} size={15} />
            </button>
          </span>
        ))}
      </div>

      <div className="fd-cap finder-glass">
        <GlassLayers small />
        <button
          className="fd-btn fd-btn--wide"
          disabled={!isFiles || view === 'columns' || view === 'gallery'}
          title="Group"
          onClick={(e) => openMenu(e, GROUPS.map(([id, label]) => ({
            label, checked: group === id, onClick: () => setGroup(id),
          })))}
        >
          <SFSymbol name="square.grid.3x1.below.line.grid.1x2" size={16} />
          <SFSymbol name="chevron.down" size={8} />
        </button>
      </div>

      <div className="fd-cap finder-glass">
        <GlassLayers small />
        <button className="fd-btn" title="Share" disabled={!current || current.inTrash}
          onClick={() => { play('open'); startAirDrop() }}>
          <SFSymbol name="square.and.arrow.up" size={15} />
        </button>
        <button className="fd-btn" title="Tags" disabled={!canTag}
          onClick={(e) => openMenu(e, [{ tags: TAGS, selected: current.tags, onToggle: (t) => toggleTag(current.desktopId, t) }])}>
          <SFSymbol name="tag" size={15} />
        </button>
        <button className="fd-btn" title="More"
          onClick={(e) => openMenu(e, [
            { label: 'New Folder', icon: 'folder.badge.plus', shortcut: '⇧⌘N', disabled: contentView !== 'desktop',
              onClick: () => { const id = newFolder(window.innerWidth - 192, 80); setSelected(id) } },
            { sep: true },
            { label: 'Open', icon: 'arrow.up.right.square', disabled: !current || current.inTrash, onClick: () => current.onOpen?.() },
            { label: 'Get Info', icon: 'info.circle', shortcut: '⌘I', disabled: !current, onClick: () => info(current) },
            { sep: true },
            { label: 'Move to Trash', icon: 'trash', disabled: !current?.trash, onClick: () => { play('trash'); trashItem(current.trash); setSelected(null) } },
          ])}>
          <SFSymbol name="ellipsis" size={15} />
        </button>
      </div>

      {/* Tahoe keeps search as a round button until you need it. */}
      {searchOpen || search ? (
        <div className="finder-search finder-glass fd-search">
          <GlassLayers small />
          <SFSymbol name="magnifyingglass" size={12} style={{ opacity: 0.6 }} />
          <input
            autoFocus
            value={search}
            placeholder="Search"
            onChange={(e) => {
              setSearch(e.target.value)
              setSelected(null)
              // From a place with nothing to search, search Applications.
              if (isHome) setContentView('applications')
            }}
            onBlur={() => { if (!search) setSearchOpen(false) }}
            onKeyDown={(e) => { if (e.key === 'Escape') { setSearch(''); setSearchOpen(false) } }}
            onMouseDown={stop}
            className="bg-transparent text-[12px] outline-none w-full"
          />
        </div>
      ) : (
        <div className="fd-cap fd-cap--round finder-glass">
          <GlassLayers small />
          <button className="fd-btn" title="Search" onClick={() => setSearchOpen(true)}>
            <SFSymbol name="magnifyingglass" size={15} />
          </button>
        </div>
      )}
    </div>
  )

  /* ── Sidebar ── */

  const selectSlice = (type, id) => {
    if (type && pfType === type && pfItem === id) { setPfType(null); setPfItem(null) }
    else { setPfType(type); setPfItem(id) }
  }

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={210} controls={{ onClose, onMinimize, onMaximize }}>
      <div className="fd-side window-scroll">
        <Row symbol="clock" label="Recents" active={contentView === 'recents'} onClick={() => go('recents')} />

        <p className="fd-section">Favorites</p>
        {FAVORITES.map((fav) => (
          <div key={fav.id}>
            <Row symbol={fav.symbol} label={fav.label} active={contentView === fav.id} onClick={() => clickFav(fav.id)} />
            <div className="fd-sub" data-open={(contentView === fav.id && unfolded.has(fav.id)) || undefined}>
            <div>

            {/* Inside Portfolio, Notes or Store, their sections show under
                the row — the way a folder's contents indent beneath it. */}
            {fav.id === 'portfolio' && (
              <>
                <Row indent symbol="square.grid.2x2" label="All" active={!pfType} onClick={() => selectSlice(null, null)} />
                <Row indent symbol="clock" label="Recents" active={pfType === 'recent'} onClick={() => selectSlice('recent', 'recent')} />
                {CATEGORIES.flatMap((c) => c.items).map((item) => (
                  <Row indent key={item.id} symbol={CATEGORY_SYMBOLS[item.id] ?? 'photo'} label={item.label}
                    active={pfType === 'category' && pfItem === item.id}
                    onClick={() => selectSlice('category', item.id)} />
                ))}
              </>
            )}
            {fav.id === 'notes' && NOTE_CATEGORIES.map((cat) => (
              <Row indent key={cat.id} symbol="folder" label={cat.label}
                active={noteCat === cat.id} onClick={() => setNoteCat(cat.id)} />
            ))}
            {fav.id === 'shop' && (
              <>
                <Row indent symbol="square.grid.2x2" label="All resources" active={!shopCat} onClick={() => setShopCat(null)} />
                {SHOP_CATEGORIES.map((cat) => (
                  <Row indent key={cat} symbol="folder" label={cat}
                    active={shopCat === cat} onClick={() => setShopCat(shopCat === cat ? null : cat)} />
                ))}
              </>
            )}
            </div>
            </div>
          </div>
        ))}

        <p className="fd-section">Locations</p>
        <Row symbol="trash" label="Trash" active={inTrash} onClick={() => go('trash')} />

        <p className="fd-section">Tags</p>
        {TAGS.map((t) => (
          <Row key={t.id} dot={t.color} label={t.label} active={tagId === t.id} onClick={() => go(`tag:${t.id}`)} />
        ))}
      </div>
    </WindowSidebar>
  )

  /* ── What each file location shows when it is empty ── */
  const empty = (
    <div className="fd-empty">
      {inTrash ? (
        <>
          <img src={trashIcon} alt="" draggable={false} />
          <p className="fd-empty__title">Trash is Empty</p>
          <p className="fd-empty__sub">Drag a file from the desktop, or an app from Applications, onto the Trash in the dock.</p>
        </>
      ) : search ? (
        <p className="fd-empty__title">No Results</p>
      ) : tagId ? (
        <p className="fd-empty__sub">Nothing is tagged {locationName}. Right-click a file on the desktop to tag it.</p>
      ) : contentView === 'recents' ? (
        <p className="fd-empty__sub">Apps and files you open show up here.</p>
      ) : null}
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Window id="finder" navSlot={navSlot} toolbar={toolbar} sidebarContent={sidebarContent} titleBarBorder={false}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* The Trash keeps a bar under the toolbar with its one button. */}
        {inTrash && (
          <div className="finder-subbar">
            <span className="finder-subbar__name">Trash</span>
            <button className="finder-empty-btn" disabled={!trashFull} onClick={() => setConfirmEmpty(true)} onPointerDown={stop}>
              Empty
            </button>
          </div>
        )}

        <div
          className={isEmbedded || view === 'columns' || view === 'gallery' ? '' : 'window-scroll px-4 pb-4 pt-1'}
          style={{ flex: 1, minHeight: 0, overflowY: isEmbedded ? 'hidden' : 'auto' }}
        >
          {/* No transition between places: Finder swaps the contents in the
              same frame. A fade out and back in read as the window jumping. */}
          {isHome ? (
              <div key="home" style={{ height: '100%' }}>
                <ChatPanel />
              </div>
            ) : isPortfolio ? (
              <div key="portfolio" style={{ height: '100%', width: '100%' }}>
                <PortfolioPanel type={pfType} item={pfItem} search={search} viewMode={pfView}
                  columns="repeat(auto-fill, minmax(170px, 1fr))" />
              </div>
            ) : isNotes ? (
              <div key="notes" style={{ height: '100%', width: '100%' }}>
                <NotesPanel category={noteCat} onCategoryChange={setNoteCat} search={search} />
              </div>
            ) : isShop ? (
              <div key="shop" style={{ height: '100%', width: '100%' }}>
                <ShopPanel category={shopCat} search={search} heading={false} />
              </div>
            ) : (
              <div key={contentView} style={{ height: '100%' }}>
                <FinderBrowser
                  items={items}
                  view={view}
                  group={group}
                  selectedId={selected}
                  onSelect={setSelected}
                  onContextMenu={(e, it) => setMenu({ at: { x: e.clientX, y: e.clientY }, items: itemMenu(it) })}
                  renderIcon={contentView === 'applications'
                    ? (it, props) => <AppTile app={it} props={props} onTrash={trashApp} onBlocked={setBlockedApp} />
                    : undefined}
                  empty={empty}
                />
              </div>
            )}
        </div>
      </div>

      <ContextMenu at={menu?.at} items={menu?.items ?? []} onClose={() => setMenu(null)} />

      <MacAlert
        open={confirmEmpty}
        icon={trashIcon}
        title="Are you sure you want to permanently erase the items in the Trash?"
        message="You can't undo this action."
        confirmLabel="Empty Trash"
        onConfirm={() => { play('emptyTrash'); emptyTrash(); setConfirmEmpty(false); setSelected(null) }}
        onCancel={() => setConfirmEmpty(false)}
      />

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
