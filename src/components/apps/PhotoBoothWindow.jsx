import { useCallback, useEffect, useRef, useState } from 'react'
import Window from '@/components/window/Window'
import useWindowStore from '@/store/windowStore'
import { halftone } from '@/utils/photoFilters'

/* ── Photo Booth ───────────────────────────────────────────────────────────
   The camera, the Retro Dot filter, and a shutter.

   The point of it is the Retro Dot filter: the halftone this portfolio ships
   as a standalone tool, running live on the webcam. The maths lives in
   `utils/photoFilters.js` so it can be tested without a camera.

   Nothing leaves the browser. There is no upload, no canvas readback sent
   anywhere; frames are drawn and thrown away, and a captured photo lives in
   React state until the window closes.                                     */

const FX = [
  { id: 'none', label: 'Normal' },
  { id: 'dots', label: 'Retro Dot' },
]

export default function PhotoBoothWindow() {
  const win = useWindowStore((s) => s.windows.find((w) => w.id === 'photo-booth'))
  const isOpen = !!win?.isOpen && !win?.isMinimized

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(0)

  const [fx, setFx] = useState('dots')
  const [state, setState] = useState('idle')   // idle | live | denied | unsupported
  const [shots, setShots] = useState([])
  const [flash, setFlash] = useState(false)
  const fxRef = useRef(fx)
  useEffect(() => { fxRef.current = fx }, [fx])

  /* The camera is only held while the window is actually on screen. Leaving a
     webcam running behind a closed window would be indefensible. */
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    if (!navigator.mediaDevices?.getUserMedia) { setState('unsupported'); return }

    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        setState('live')
      })
      .catch(() => { if (!cancelled) setState('denied') })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setState('idle')
    }
  }, [isOpen])

  /* One draw loop for every effect, so a captured still is exactly the frame
     that was on screen rather than a second, differently-produced image. */
  useEffect(() => {
    if (state !== 'live') return
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const v = videoRef.current
      const c = canvasRef.current
      if (!v || !c || v.readyState < 2) return
      const w = c.width, h = c.height
      const ctx = c.getContext('2d', { willReadFrequently: true })

      // Mirrored, the way every webcam preview is.
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(v, -w, 0, w, h)
      ctx.restore()

      if (fxRef.current !== 'dots') return
      halftone(ctx, ctx.getImageData(0, 0, w, h), w, h)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [state])

  const capture = useCallback(() => {
    const c = canvasRef.current
    if (!c || state !== 'live') return
    setFlash(true)
    setTimeout(() => setFlash(false), 220)
    setShots((prev) => [c.toDataURL('image/png'), ...prev].slice(0, 8))
  }, [state])

  return (
    <Window id="photo-booth" title="Photo Booth" minSize={{ width: 560, height: 480 }}>
      <div className="pb">
        <div className="pb__stage">
          <video ref={videoRef} playsInline muted className="pb__video" />
          <canvas ref={canvasRef} width={640} height={480} className="pb__canvas" />

          {state !== 'live' && (
            <div className="pb__notice">
              {state === 'denied' && (
                <>
                  <p className="pb__notice-title">Camera unavailable</p>
                  <p>Allow camera access to use Photo Booth. Nothing is uploaded —
                     every frame stays in this browser.</p>
                </>
              )}
              {state === 'unsupported' && (
                <>
                  <p className="pb__notice-title">No camera API</p>
                  <p>This browser does not expose a camera to web pages.</p>
                </>
              )}
              {state === 'idle' && <p>Starting camera…</p>}
            </div>
          )}

          <div className="pb__flash" data-on={flash || undefined} />
        </div>

        <div className="pb__fx">
          {FX.map((f) => (
            <button
              key={f.id}
              className="pb__fx-btn"
              data-on={fx === f.id || undefined}
              onClick={() => setFx(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="pb__bar">
          <button className="pb__shutter" onClick={capture} disabled={state !== 'live'}>
            <span />
            Take Photo
          </button>
        </div>

        {shots.length > 0 && (
          <div className="pb__strip">
            {shots.map((src, i) => (
              <a key={i} href={src} download={`photo-booth-${shots.length - i}.png`} title="Download">
                <img src={src} alt={`Capture ${shots.length - i}`} />
              </a>
            ))}
          </div>
        )}
      </div>
    </Window>
  )
}
