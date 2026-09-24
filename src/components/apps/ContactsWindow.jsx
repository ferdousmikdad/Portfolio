import { useState } from 'react'
import Window from '@/components/window/Window'
import GlassLayers from '@/components/ui/LiquidGlass'
import SFSymbol from '@/components/ui/SFSymbol'
import useWindowStore from '@/store/windowStore'
import mikdadPhoto from '@/assets/images/mikdad.jpg'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'
import { CONTACT, SOCIAL_LINKS } from '@/data/mikudaAI'

/* ── Contacts ────────────────────────────────────────────────────────────────
   The "About Me" window, rebuilt as the macOS Tahoe Contacts app: a list
   column on the window's own colour, and the card in an inset, darker pane
   beside it. Measured off the real app at 2x — avatar 112pt, name 27pt bold,
   four 40pt round action buttons 8pt apart, and the fields in 12pt-radius
   grouped cards that stop at 340pt wide however large the window gets.

   Two cards, because a Mac always has two: the owner's "My Card", and
   Mikuda, whose Message button is the way into the Home chat.            */

const BIO =
  "Designer & developer building simple, usable digital products. 5+ years in design — started " +
  'with print & branding, moved into digital products. UI/UX, branding, motion design and ' +
  'front-end development; self-taught developer, comfortable from Figma to React.\n\n' +
  'Tools: Figma, After Effects, Framer, React, Tailwind.'

const hostOf = (href) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

const PEOPLE = [
  {
    id: 'me',
    name: 'Ferdous Mikdad',
    subtitle: 'My Card',
    title: 'UI/UX Designer & Web Developer',
    photo: mikdadPhoto,
    actions: { message: 'home', phone: CONTACT.phone, video: null, mail: CONTACT.email },
    groups: [
      [
        { label: 'mobile', value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, '')}` },
        { label: 'email',  value: CONTACT.email, href: `mailto:${CONTACT.email}` },
      ],
      SOCIAL_LINKS.map((s) => ({ label: s.label, value: s.handle, href: s.href, title: hostOf(s.href) })),
      [
        { label: 'availability', value: 'Open to freelance projects, collaborations and full-time roles' },
      ],
    ],
    notes: BIO,
  },
  {
    id: 'mikuda',
    name: 'Mikuda',
    subtitle: 'Assistant',
    title: "Mikdad's assistant",
    photo: mikdadHeadUrl,
    illustrated: true,
    actions: { message: 'home', phone: null, video: null, mail: null },
    groups: [],
    notes:
      "Ask me anything about Mikdad's work, skills or projects — or how to reach him. " +
      "I answer in Messages, under Home.",
  },
]

// ── vCard ─────────────────────────────────────────────────────────────────────

/* Share hands over the same thing the real Share button does: a .vcf that
   drops straight into anyone's Contacts. */
function downloadVCard(p) {
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`)
  const [first, ...rest] = p.name.split(' ')
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(rest.join(' '))};${esc(first)};;;`,
    `FN:${esc(p.name)}`,
    `TITLE:${esc(p.title)}`,
    `TEL;TYPE=CELL:${CONTACT.phone}`,
    `EMAIL;TYPE=INTERNET:${CONTACT.email}`,
    ...SOCIAL_LINKS.map((s) => `URL;TYPE=${esc(s.label)}:${s.href}`),
    `NOTE:${esc(p.notes)}`,
    'END:VCARD',
  ]
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/vcard' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${p.name}.vcf` })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── Pieces ────────────────────────────────────────────────────────────────────

function Avatar({ person, size }) {
  return (
    <span className={`ct-avatar${person.illustrated ? ' ct-avatar--illustrated' : ''}`} style={{ width: size, height: size }}>
      <img src={person.photo} alt="" draggable={false} />
    </span>
  )
}

const ACTIONS = [
  { key: 'message', symbol: 'message.fill',  label: 'Message' },
  { key: 'phone',   symbol: 'phone.fill',    label: 'Call' },
  { key: 'video',   symbol: 'video.fill',    label: 'FaceTime' },
  { key: 'mail',    symbol: 'envelope.fill', label: 'Mail' },
]

function Card({ person }) {
  const navigate       = useWindowStore((s) => s.navigate)
  const openMailWindow = useWindowStore((s) => s.openMailWindow)

  const run = (key) => {
    const target = person.actions[key]
    if (key === 'message') navigate(target)
    if (key === 'phone')   window.location.href = `tel:${target.replace(/\s/g, '')}`
    if (key === 'mail')    openMailWindow(target)
  }

  return (
    <div className="ct-card">
      <Avatar person={person} size={112} />
      <h1 className="ct-name">{person.name}</h1>
      <p className="ct-title">{person.title}</p>

      {/* Unavailable actions stay in the row, dimmed — Contacts never
          reflows these four, it greys out the ones a card cannot do. */}
      <div className="ct-actions">
        {ACTIONS.map((a) => {
          const on = !!person.actions[a.key]
          return (
            <button key={a.key} className="ct-action" disabled={!on} title={a.label} aria-label={a.label} onClick={() => run(a.key)}>
              <SFSymbol name={a.symbol} size={17} />
            </button>
          )
        })}
      </div>

      {person.groups.map((rows, i) => (
        <div key={i} className="ct-group">
          {rows.map((r) => (
            <div key={`${r.label}-${r.value}`} className="ct-field">
              <span className="ct-field__label">{r.label}</span>
              {r.href ? (
                <a className="ct-field__value ct-field__value--link" href={r.href} target="_blank" rel="noreferrer" title={r.title ?? r.value}>
                  {r.value}
                </a>
              ) : (
                <span className="ct-field__value">{r.value}</span>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="ct-group ct-notes">
        <span className="ct-field__label">Notes</span>
        <p className="ct-notes__text">{person.notes}</p>
      </div>
    </div>
  )
}

// ── Window ────────────────────────────────────────────────────────────────────

export default function ContactsWindow() {
  const [selectedId, setSelectedId] = useState('me')
  const [listOpen,   setListOpen]   = useState(true)
  const [query,      setQuery]      = useState('')

  const q = query.trim().toLowerCase()
  const people = q ? PEOPLE.filter((p) => `${p.name} ${p.title}`.toLowerCase().includes(q)) : PEOPLE
  const selected = PEOPLE.find((p) => p.id === selectedId) ?? PEOPLE[0]

  /* The sidebar toggle sits right after the traffic lights, as in the real
     window; the trailing group is Share and the search field. */
  const sidebarToggle = (
    <button
      className="ct-tb-btn finder-glass"
      style={{ marginLeft: 10, pointerEvents: 'auto' }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => setListOpen((v) => !v)}
      title={listOpen ? 'Hide Contacts List' : 'Show Contacts List'}
    >
      <GlassLayers small />
      <SFSymbol name="sidebar.left" size={16} />
    </button>
  )

  const toolbar = (
    <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }} onPointerDown={(e) => e.stopPropagation()}>
      {selected.id === 'me' && (
        <button className="ct-tb-btn finder-glass" onClick={() => downloadVCard(selected)} title="Share Contact (.vcf)">
          <GlassLayers small />
          <SFSymbol name="square.and.arrow.up" size={15} />
        </button>
      )}
      <div className="finder-search finder-glass" style={{ minWidth: 180 }}>
        <GlassLayers small />
        <SFSymbol name="magnifyingglass" size={12} style={{ opacity: 0.6 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="bg-transparent text-[12px] outline-none w-full"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )

  return (
    <Window id="about" navSlot={sidebarToggle} toolbar={toolbar} minSize={{ width: 560, height: 420 }}>
      <div className="ct-body">
        {listOpen && (
          <div className="ct-list">
            {people.map((p) => (
              <button
                key={p.id}
                className={`ct-row${p.id === selected.id ? ' ct-row--on' : ''}`}
                onClick={() => setSelectedId(p.id)}
              >
                <Avatar person={p} size={32} />
                <span className="ct-row__text">
                  <span className="ct-row__name">{p.name}</span>
                  <span className="ct-row__sub">{p.subtitle}</span>
                </span>
              </button>
            ))}
            {people.length === 0 && <p className="ct-list__empty">No Results</p>}
          </div>
        )}
        <div className="ct-detail window-scroll">
          <Card key={selected.id} person={selected} />
        </div>
      </div>
    </Window>
  )
}
