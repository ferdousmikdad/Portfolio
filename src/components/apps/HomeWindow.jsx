import { useState, useCallback, useMemo } from 'react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import GlassLayers from '@/components/ui/LiquidGlass'
import SFSymbol from '@/components/ui/SFSymbol'
import ChatPanel, { GREETING } from '@/components/apps/ChatPanel'
import useWindowStore from '@/store/windowStore'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

/* ── Home — Messages, with Mikuda on the other end ───────────────────────────
   Laid out as the Tahoe Messages window: the glass sidebar carries the
   traffic lights, a compose button and a search field over the list of
   conversations; the pane beside it is the open conversation, its contact
   named at the top centre.

   Every conversation is a ChatPanel of its own, all kept mounted so a thread
   is still there when you come back to it. The topic conversations ask their
   question the first time they are opened, so each one arrives answered. */

const THREADS = [
  { id: 'mikuda',    name: 'Mikuda',    avatar: 'mikuda',                   preview: GREETING },
  { id: 'projects',  name: 'Projects',  avatar: 'photo.on.rectangle.angled', starter: 'Show me his projects' },
  { id: 'skills',    name: 'Skills',    avatar: 'sparkles',                  starter: 'What are his skills?' },
  { id: 'freelance', name: 'Freelance', avatar: 'briefcase.fill',            starter: 'Is he available for freelance?' },
  { id: 'contact',   name: 'Contact',   avatar: 'envelope.fill',             starter: 'How can I contact him?' },
]

const clock = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

/* The grey disc Messages gives a contact without a photo, with either
   Mikuda's own face or the topic's symbol in white. */
function ThreadAvatar({ thread, size }) {
  return (
    <span className="msg-avatar" style={{ width: size, height: size }}>
      {thread.avatar === 'mikuda'
        ? <img src={mikdadHeadUrl} alt="" draggable={false} />
        : <SFSymbol name={thread.avatar} size={Math.round(size * 0.46)} />}
    </span>
  )
}

export default function HomeWindow() {
  const navigate = useWindowStore((s) => s.navigate)

  const [activeId, setActiveId] = useState('mikuda')
  const [visited,  setVisited]  = useState(() => new Set(['mikuda']))
  const [activity, setActivity] = useState({})
  const [query,    setQuery]    = useState('')

  /* One stable reporter per thread, so a ChatPanel's effect only reruns
     when its own messages change. */
  const reporters = useMemo(
    () => Object.fromEntries(THREADS.map((t) => [
      t.id, (a) => setActivity((prev) => ({ ...prev, [t.id]: a })),
    ])),
    [],
  )

  const open = useCallback((id) => {
    setActiveId(id)
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])

  // Compose: a fresh Mikuda conversation, the way ⌘N starts a new message.
  const [generation, setGeneration] = useState(0)
  const compose = () => {
    setGeneration((g) => g + 1)
    setActivity((prev) => ({ ...prev, mikuda: undefined }))
    open('mikuda')
  }

  const q = query.trim().toLowerCase()
  const listed = q ? THREADS.filter((t) => t.name.toLowerCase().includes(q)) : THREADS
  const active = THREADS.find((t) => t.id === activeId)

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={290} gutter="6px 0 6px 6px" controls={{ onClose, onMinimize, onMaximize }}>
      <button className="msg-compose-btn" onClick={compose} title="New Message">
        <SFSymbol name="square.and.pencil" size={15} />
      </button>

      <label className="msg-search">
        <SFSymbol name="magnifyingglass" size={13} style={{ opacity: 0.6 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </label>

      <div className="msg-list">
        {listed.map((t) => {
          const a = activity[t.id]
          return (
            <button
              key={t.id}
              className={`msg-convo${t.id === activeId ? ' msg-convo--on' : ''}`}
              onClick={() => open(t.id)}
            >
              <ThreadAvatar thread={t} size={40} />
              <span className="msg-convo__text">
                <span className="msg-convo__top">
                  <span className="msg-convo__name">{t.name}</span>
                  {a?.at && <span className="msg-convo__time">{clock(a.at)}</span>}
                </span>
                <span className="msg-convo__preview">{a?.preview || t.preview || t.starter}</span>
              </span>
            </button>
          )
        })}
      </div>
    </WindowSidebar>
  )

  /* The contact, centred over the conversation. It sits in the title bar
     so the whole strip still drags the window. */
  const header = (
    <div className="msg-header">
      <ThreadAvatar thread={active} size={26} />
      <span className="msg-header__name">{active.name}</span>
    </div>
  )

  const toolbar = (
    <button
      className="ct-tb-btn finder-glass"
      style={{ pointerEvents: 'auto' }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => navigate('about')}
      title="Contact info"
    >
      <GlassLayers small />
      <SFSymbol name="info.circle" size={16} />
    </button>
  )

  return (
    <Window id="home" sidebarContent={sidebarContent} navSlot={header} toolbar={toolbar}>
      {THREADS.filter((t) => visited.has(t.id)).map((t) => (
        <div key={t.id === 'mikuda' ? `mikuda-${generation}` : t.id} style={{ display: t.id === activeId ? 'block' : 'none', height: '100%' }}>
          <ChatPanel
            active={t.id === activeId}
            starter={t.starter}
            greeting={t.id === 'mikuda'}
            onActivity={reporters[t.id]}
          />
        </div>
      ))}
    </Window>
  )
}
