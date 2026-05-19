import { useEffect, useRef } from 'react'
import useCursorStore from '@/store/cursorStore'
import useSettingsStore from '@/store/settingsStore'

export default function Cursor() {
  const cursor      = useCursorStore((s) => s.cursor)
  const accentColor = useSettingsStore((s) => s.accentColor)
  const elRef       = useRef(null)

  // toggle native cursor visibility
  useEffect(() => {
    document.documentElement.classList.toggle('cursor-custom', cursor !== 'system')
  }, [cursor])

  // move the element with the mouse
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const onMove = (e) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [cursor])

  if (cursor === 'system') return null

  const base = {
    position: 'fixed', top: 0, left: 0,
    pointerEvents: 'none', zIndex: 99999, willChange: 'transform',
  }

  if (cursor === 'hand') {
    return (
      <div ref={elRef} style={{ ...base, marginLeft: -5, marginTop: -2, color: accentColor }}>
        <svg width="18" height="22" viewBox="0 0 18 22" fill="currentColor">
          <path d="M6 0C4.9 0 4 .9 4 2v7.1C3.1 9.4 2.5 10.2 2.5 11v5C2.5 19.6 5.1 22 8.5 22S14.5 19.6 14.5 16v-5c0-.8-.6-1.6-1.5-1.9V5c0-1.1-.9-2-2-2s-2 .9-2 2v-.5C9 3.4 8.1 2.5 7 2.5S5 3.4 5 4.5V2C5 .9 5.5 0 6 0z"/>
        </svg>
      </div>
    )
  }

  // dot (default)
  return (
    <div
      ref={elRef}
      style={{
        ...base,
        width: 8, height: 8,
        marginLeft: -4, marginTop: -4,
        borderRadius: '50%',
        background: accentColor,
      }}
    />
  )
}
