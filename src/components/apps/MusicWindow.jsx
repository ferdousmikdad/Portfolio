import { useState } from 'react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import SFSymbol from '@/components/ui/SFSymbol'

/* ── Music ──────────────────────────────────────────────────────────────────
   Drawn as Tahoe's Music app, measured off the real window: a glass sidebar
   of outline-symbol rows under grey section titles (Library, Playlists) with
   the account pinned to the bottom, the selected row a grey slab in the
   accent; the content opens with a large bold title.

   The music itself is Mikdad's playlist, played through Spotify's embed —
   the one thing here that is not Apple's, because it is the one that
   actually plays. Only rows that lead somewhere are listed.               */

const PLAYLIST = {
  id: 'mikdad',
  name: 'Para-30',
  embedUrl: 'https://open.spotify.com/embed/playlist/4BvCU8yghrXCOazw1xN22N?utm_source=generator&si=f3116bf7fc144055',
  openUrl: 'https://open.spotify.com/playlist/4BvCU8yghrXCOazw1xN22N',
}

function Row({ symbol, label, active, onClick }) {
  return (
    <button className="mu-row" data-on={active || undefined} onClick={onClick}>
      <SFSymbol name={symbol} size={16} className="mu-row__icon" />
      <span>{label}</span>
    </button>
  )
}

export default function MusicWindow() {
  const [page, setPage] = useState('home')   // 'home' | 'playlist'

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={230} controls={{ onClose, onMinimize, onMaximize }}>
      <div className="mu-side">
        <Row symbol="house" label="Home" active={page === 'home'} onClick={() => setPage('home')} />

        <p className="mu-section">Playlists</p>
        <Row symbol="music.note.list" label={PLAYLIST.name} active={page === 'playlist'} onClick={() => setPage('playlist')} />

        <div className="mu-account">
          <span className="mu-account__avatar">FM</span>
          <span className="mu-account__name">Ferdous Mikdad</span>
        </div>
      </div>
    </WindowSidebar>
  )

  const player = (
    <iframe
      key={PLAYLIST.embedUrl}
      className="mu-embed"
      src={PLAYLIST.embedUrl}
      width="100%"
      height="352"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title={PLAYLIST.name}
    />
  )

  return (
    <Window id="spotify" sidebarContent={sidebarContent} hideTitleBar={false}>
      <div className="mu-body window-scroll">
        {page === 'home' ? (
          <>
            <h1 className="mu-title">Home</h1>
            <div className="mu-hero">
              <p className="mu-hero__eyebrow">Made by Mikdad</p>
              <p className="mu-hero__title">What’s playing while the pixels get pushed.</p>
              <p className="mu-hero__sub">The playlist behind the work — press play and keep browsing.</p>
            </div>
            <h2 className="mu-section-title">Listen Now</h2>
            {player}
          </>
        ) : (
          <>
            <div className="mu-head">
              <span className="mu-art"><SFSymbol name="music.note" size={64} /></span>
              <div className="mu-head__text">
                <p className="mu-head__kind">Playlist</p>
                <h1 className="mu-head__name">{PLAYLIST.name}</h1>
                <p className="mu-head__by">Ferdous Mikdad</p>
                <a className="mu-open" href={PLAYLIST.openUrl} target="_blank" rel="noreferrer">
                  Open in Spotify
                </a>
              </div>
            </div>
            {player}
          </>
        )}
      </div>
    </Window>
  )
}
