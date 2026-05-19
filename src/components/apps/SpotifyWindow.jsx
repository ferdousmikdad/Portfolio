import { useState } from 'react'
import Window from '@/components/window/Window'
import WindowControls from '@/components/window/WindowControls'

// ── Playlists / artists to embed ─────────────────────────────────────────────
// Add more entries here later — each needs an embedUrl from Spotify

const PLAYLISTS = [
  {
    id: 'mikdad-artist',
    name: 'Mikdad',
    type: 'Artist',
    color: '#1DB954',
    embedUrl: 'https://open.spotify.com/embed/artist/1fyFmy2K3SqMhKpFxF1EDv?utm_source=generator&theme=0',
  },
]

// ── Sidebar icon ──────────────────────────────────────────────────────────────

function SpotifyLogo() {
  return (
    <svg viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 72, height: 22 }}>
      <path fill="white" d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.52 17.34a.75.75 0 01-1.03.24C14.23 15.9 11 15.27 7.22 16.1a.75.75 0 01-.34-1.46c4.18-.96 7.76-.27 10.4 1.66a.75.75 0 01.24 1.04zm1.47-3.27a.94.94 0 01-1.29.3C14.9 12.2 11.09 11.52 6.57 12.73a.93.93 0 01-.45-1.81c5.05-1.35 9.37-.56 12.58 1.86a.94.94 0 01.29 1.29zm.13-3.4C16.14 8.14 11.42 7.6 7.1 8.83a1.12 1.12 0 01-.61-2.16C11.28 5.37 16.67 5.99 20.2 8.88a1.12 1.12 0 01-1.08 1.79z"/>
      <path fill="white" d="M30.5 14.1c-2.1-.5-2.47-.85-2.47-1.59 0-.7.66-1.18 1.64-1.18 .95 0 1.9.36 2.88 1.09a.2.2 0 00.27-.04l1.22-1.72a.2.2 0 00-.04-.28c-1.2-.95-2.56-1.41-4.3-1.41-2.42 0-4.1 1.45-4.1 3.53 0 2.22 1.46 3.01 3.8 3.57 2 .47 2.35.86 2.35 1.55 0 .77-.68 1.26-1.79 1.26-1.23 0-2.23-.42-3.35-1.38a.2.2 0 00-.28.03l-1.37 1.62a.2.2 0 00.02.28c1.26 1.13 2.82 1.73 4.9 1.73 2.62 0 4.32-1.43 4.32-3.63 0-1.87-1.12-2.9-3.7-3.43zM38.8 9h-2.17a.2.2 0 00-.2.2v11.67c0 .1.09.2.2.2h2.17c.11 0 .2-.1.2-.2V9.2a.2.2 0 00-.2-.2zM46.5 9h-2.43L41 20.87h2.47l.66-1.98h3.05l.65 1.98H50.2L46.5 9zm-1.79 7.52 1.01-3.04 1.01 3.04h-2.02zM55.93 15.3l-3.1-6.1a.2.2 0 00-.18-.2h-2.33a.2.2 0 00-.2.2v11.67c0 .1.09.2.2.2h2.12c.11 0 .2-.1.2-.2v-7.54l3.32 7.64a.2.2 0 00.18.1h2.08a.2.2 0 00.18-.1l3.32-7.63v7.53c0 .1.09.2.2.2h2.12c.11 0 .2-.1.2-.2V9.2a.2.2 0 00-.2-.2h-2.33a.2.2 0 00-.18.2l-5.61 6.1zM72.8 9h-6.25a.2.2 0 00-.2.2v11.67c0 .1.09.2.2.2H72.8c.11 0 .2-.1.2-.2v-1.97a.2.2 0 00-.2-.2h-3.88v-2.6h3.5a.2.2 0 00.2-.2V14a.2.2 0 00-.2-.2h-3.5v-2.37h3.88a.2.2 0 00.2-.2V9.2a.2.2 0 00-.2-.2z"/>
    </svg>
  )
}

function LibraryItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 8px',
        borderRadius: 8,
        background: active ? '#282828' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.12s ease',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#1a1a1a' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 4,
        background: item.color,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
      }}>
        🎵
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: 13,
          fontWeight: 500,
          color: active ? '#fff' : '#b3b3b3',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: "'SF Pro Text', sans-serif",
        }}>
          {item.name}
        </p>
        <p style={{ fontSize: 11, color: '#6b6b6b', margin: 0, fontFamily: "'SF Pro Text', sans-serif" }}>
          {item.type}
        </p>
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SpotifyWindow() {
  const [activeId, setActiveId] = useState(PLAYLISTS[0].id)
  const current = PLAYLISTS.find((p) => p.id === activeId) ?? PLAYLISTS[0]

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <div style={{ width: 220, padding: '6px 0 6px 6px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{
        background: '#000000',
        border: '1px solid #282828',
        borderRadius: 18,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Traffic lights */}
        <div style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0 }}>
          <WindowControls onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />
        </div>

        {/* Spotify wordmark */}
        <div style={{ padding: '4px 16px 16px', flexShrink: 0 }}>
          <SpotifyLogo />
        </div>

        {/* Library */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
          <p style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#6b6b6b',
            letterSpacing: '0.1em',
            padding: '0 8px 8px',
            margin: 0,
            fontFamily: "'SF Pro Text', sans-serif",
          }}>
            YOUR LIBRARY
          </p>
          {PLAYLISTS.map((item) => (
            <LibraryItem
              key={item.id}
              item={item}
              active={activeId === item.id}
              onClick={() => setActiveId(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <Window
      id="spotify"
      sidebarContent={sidebarContent}
      hideTitleBar={false}
      shellStyle={{ background: '#121212', border: '1px solid #282828' }}
    >
      <iframe
        key={current.embedUrl}
        src={current.embedUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ display: 'block', border: 'none' }}
        title={current.name}
      />
    </Window>
  )
}
