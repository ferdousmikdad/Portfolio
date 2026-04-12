import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    let x = -100, y = -100

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      dot.style.transform = `translate(${x}px, ${y}px)`
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        marginLeft: -4,
        marginTop: -4,
        borderRadius: '50%',
        background: '#cf0506',
        pointerEvents: 'none',
        zIndex: 99999,
        willChange: 'transform',
      }}
    />
  )
}
