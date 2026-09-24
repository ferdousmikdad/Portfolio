import { useEffect, useMemo, useRef, useState } from 'react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import SFSymbol from '@/components/ui/SFSymbol'
import { ResourcePanes } from '@/components/apps/ShopPanel'
import useSound from '@/hooks/useSound'
import resources, { allCss, toHtmlFile, SHOP_CATEGORIES } from '@/data/stickResources'

/* ── The App Store ──────────────────────────────────────────────────────────
   The Store, drawn as Tahoe's App Store, measured off the real window at 2x:

   Sidebar  a search field at the top, then rows with an outline symbol —
            Discover, then this store's own sections the way the real one
            lists Create / Work / Play / Develop — and the account pinned to
            the bottom: initials in a grey disc, name, and a grey second line.
   Discover a hero card across the top with the featured item running and a
            big blue button; a row of category chips; then a ranked list in
            two columns — icon, rank, grey eyebrow, name, tagline and a grey
            capsule "Get" button.
   Get      the real sequence: a progress ring while it "downloads", then the
            button reads "Open". Here the download is the snippet's HTML file
            copied to the clipboard; Open goes to its product page.
   Product  back button, big icon, name, subtitle, Get; an info strip; then
            the live preview beside the file that produces it.               */

const SECTION_SYMBOLS = {
  'Forms & controls': 'slider.horizontal.3',
  'Transfer':         'arrow.left.arrow.right',
  'Loaders':          'hourglass',
  'Feedback':         'checkmark.seal',
  'Empty states':     'tray',
}

/* The animation itself, shrunk into an app-icon tile. It plays when the row
   it sits in is hovered, the way the store's cards always have. */
function ResIcon({ res, size = 64 }) {
  return (
    <span className="as-icon" style={{ width: size, height: size, borderRadius: size * 0.225 }}>
      <span className="as-icon__inner" style={{ transform: `translateY(-50%) scale(${size / 160})` }}>
        <span className="sm-frame" dangerouslySetInnerHTML={{ __html: res.html }} />
      </span>
    </span>
  )
}

/* Get → spinning ring → Open. `got` is the set of snippets already copied. */
function GetButton({ res, got, onGot, onOpen, big }) {
  const [busy, setBusy] = useState(false)
  const have = got.has(res.id)

  const get = async (e) => {
    e.stopPropagation()
    if (have) { onOpen(); return }
    setBusy(true)
    try { await navigator.clipboard.writeText(toHtmlFile(res)) } catch { /* shown as got anyway */ }
    setTimeout(() => { setBusy(false); onGot(res.id) }, 900)
  }

  return (
    <button
      className={`as-get${big ? ' as-get--big' : ''}`}
      onClick={get}
      title={have ? 'Open' : 'Get — copies the HTML file'}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {busy ? <span className="as-ring" /> : have ? 'Open' : 'Get'}
    </button>
  )
}

function Row({ res, rank, got, onGot, onOpen }) {
  return (
    <div className="as-row" onClick={onOpen} role="button" tabIndex={0}>
      <ResIcon res={res} />
      {rank && <span className="as-row__rank">{rank}</span>}
      <span className="as-row__text">
        <span className="as-row__eyebrow">{res.category}</span>
        <span className="as-row__name">{res.title}</span>
        <span className="as-row__tag">{res.blurb}</span>
      </span>
      <GetButton res={res} got={got} onGot={onGot} onOpen={onOpen} />
    </div>
  )
}

export default function ShopWindow() {
  const play = useSound()
  const [page,   setPage]   = useState('discover')   // 'discover' | a category
  const [openId, setOpenId] = useState(null)
  const [search, setSearch] = useState('')
  const [got,    setGot]    = useState(() => new Set())
  const scrollRef = useRef(null)

  const onGot = (id) => setGot((prev) => new Set(prev).add(id))
  const open  = (id) => { play('open'); setOpenId(id); scrollRef.current?.scrollTo({ top: 0 }) }
  const go    = (p) => { setPage(p); setOpenId(null); setSearch(''); scrollRef.current?.scrollTo({ top: 0 }) }

  const q = search.trim().toLowerCase()
  const found = useMemo(() => (q
    ? resources.filter((r) => `${r.title} ${r.blurb} ${r.tags.join(' ')} ${r.category}`.toLowerCase().includes(q))
    : []), [q])

  const product = resources.find((r) => r.id === openId)
  const featured = resources[0]

  // Side by side needs room; measure the pane, not the viewport.
  const [stacked, setStacked] = useState(false)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setStacked(e.contentRect.width < 720))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={220} controls={{ onClose, onMinimize, onMaximize }}>
      <div className="as-side">
        <label className="as-search">
          <SFSymbol name="magnifyingglass" size={13} style={{ opacity: 0.6 }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenId(null) }}
            placeholder="Search"
            onMouseDown={(e) => e.stopPropagation()}
          />
        </label>

        <nav className="as-nav">
          <button className="as-nav__row" data-on={(page === 'discover' && !q) || undefined} onClick={() => go('discover')}>
            <SFSymbol name="star" size={17} /> <span>Discover</span>
          </button>
          {SHOP_CATEGORIES.map((c) => (
            <button key={c} className="as-nav__row" data-on={(page === c && !q) || undefined} onClick={() => go(c)}>
              <SFSymbol name={SECTION_SYMBOLS[c] ?? 'square.grid.2x2'} size={17} /> <span>{c}</span>
            </button>
          ))}
        </nav>

        <div className="as-account">
          <span className="as-account__avatar">FM</span>
          <span className="as-account__text">
            <span className="as-account__name">Ferdous Mikdad</span>
            <span className="as-account__sub">{got.size ? `${got.size} of ${resources.length} got` : 'Everything here is free'}</span>
          </span>
        </div>
      </div>
    </WindowSidebar>
  )

  const list = (items, ranked) => (
    <div className="as-list">
      {items.map((r, i) => (
        <Row key={r.id} res={r} rank={ranked ? i + 1 : null} got={got} onGot={onGot} onOpen={() => open(r.id)} />
      ))}
    </div>
  )

  let body
  if (product) {
    body = (
      <div className="as-product">
        <button className="as-back" onClick={() => setOpenId(null)}>
          <SFSymbol name="chevron.left" size={13} />
          {q ? 'Search' : page === 'discover' ? 'Discover' : page}
        </button>
        <div className="as-product__head">
          <ResIcon res={product} size={128} />
          <div className="as-product__meta">
            <p className="as-product__name">{product.title}</p>
            <p className="as-product__sub">{product.blurb}</p>
            <GetButton res={product} got={got} onGot={onGot} onOpen={() => {}} big />
          </div>
        </div>
        <div className="as-info">
          <div><span>Category</span><b>{product.category}</b></div>
          <div><span>Format</span><b>HTML + Tailwind</b></div>
          <div><span>Price</span><b>Free</b></div>
          <div><span>Developer</span><b>Ferdous Mikdad</b></div>
        </div>
        <div className="as-product__panes">
          <ResourcePanes res={product} stacked={stacked} />
        </div>
      </div>
    )
  } else if (q) {
    body = (
      <>
        <h1 className="as-title">Results for “{search.trim()}”</h1>
        {found.length ? list(found) : <p className="as-empty">No Results</p>}
      </>
    )
  } else if (page === 'discover') {
    body = (
      <>
        <div className="as-hero" onClick={() => open(featured.id)}>
          <div className="as-hero__stage">
            <span className="sm-frame sm-frame--live" dangerouslySetInnerHTML={{ __html: featured.html }} />
          </div>
          <div className="as-hero__text">
            <p className="as-hero__eyebrow">Stick-man UI</p>
            <p className="as-hero__title">Animations that just work. One file each.</p>
            <button className="as-hero__cta" onClick={(e) => { e.stopPropagation(); open(featured.id) }}>
              See {featured.title}
            </button>
            <p className="as-hero__fine">{resources.length} animations · HTML + Tailwind · Free</p>
          </div>
        </div>

        <div className="as-chips">
          {SHOP_CATEGORIES.map((c) => (
            <button key={c} className="as-chip" onClick={() => go(c)}>
              <SFSymbol name={SECTION_SYMBOLS[c] ?? 'square.grid.2x2'} size={14} /> {c}
            </button>
          ))}
        </div>

        <h2 className="as-section">Top Free</h2>
        {list(resources, true)}
      </>
    )
  } else {
    const items = resources.filter((r) => r.category === page)
    body = (
      <>
        <h1 className="as-title">{page}</h1>
        {list(items)}
      </>
    )
  }

  return (
    <Window id="shop" sidebarContent={sidebarContent} hideTitleBar={false}>
      {/* Every snippet's keyframes, mounted once. */}
      <style dangerouslySetInnerHTML={{ __html: allCss }} />
      <div ref={scrollRef} className="as-body window-scroll">{body}</div>
    </Window>
  )
}
