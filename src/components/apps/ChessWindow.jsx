import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import Window from '@/components/window/Window'
import useChessStore from '@/store/chessStore'
import useWindowStore from '@/store/windowStore'

/* ── Chess ───────────────────────────────────────────────────────────────────
   The macOS Chess app, drawn with the app's own 3D wooden set: the board and
   the six piece meshes are converted from Chess.app's USD models, and the
   wood textures and per-piece normal maps are its own (see
   public/chess/APPLE-COPYING.txt for the licence they ship under). The
   camera sits where the real one does, behind White, looking down the board.

   Click one of your pieces to pick it up — the squares it can go to light
   up — then click where it should go. The computer answers from a worker.
   New Game, Take Back Move and Show Hint are in the menu bar, where the real
   app keeps them.                                                           */

const TYPES = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king']
const CODE = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' }
const FILES = 'abcdefgh'

// Board units: squares are 10 wide, the playing area runs -40…40.
const sqToXZ = (sq) => {
  const f = FILES.indexOf(sq[0]), r = +sq[1] - 1
  return [-35 + f * 10, 35 - r * 10]
}
const xzToSq = (x, z) => {
  const f = Math.floor((x + 40) / 10), r = Math.floor((40 - z) / 10)
  return f >= 0 && f < 8 && r >= 0 && r < 8 ? `${FILES[f]}${r + 1}` : null
}

/* Load every mesh and texture once, shared by every piece on the board. */
let assetsPromise = null
function loadAssets() {
  if (assetsPromise) return assetsPromise
  const tex = new THREE.TextureLoader()
  const obj = new OBJLoader()
  const loadTex = (url, srgb = true) => new Promise((res) => tex.load(url, (t) => {
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    res(t)
  }))
  const loadObj = (url) => new Promise((res, rej) => obj.load(url, (g) => {
    let geo = null
    g.traverse((c) => { if (c.isMesh && !geo) geo = c.geometry })
    // The meshes are Z-up; three.js is Y-up.
    geo.rotateX(-Math.PI / 2)
    res(geo)
  }, undefined, rej))
  assetsPromise = Promise.all([
    loadObj('/chess/board.obj'),
    loadTex('/chess/board.jpg'),
    loadTex('/chess/white.jpg'),
    loadTex('/chess/black.jpg'),
    ...TYPES.map((t) => loadObj(`/chess/${t}.obj`)),
    ...TYPES.map((t) => loadTex(`/chess/${t}N.jpg`, false)),
  ]).then((r) => ({
    boardGeo: r[0], boardTex: r[1], whiteTex: r[2], blackTex: r[3],
    geo: Object.fromEntries(TYPES.map((t, i) => [t, r[4 + i]])),
    normal: Object.fromEntries(TYPES.map((t, i) => [t, r[10 + i]])),
  }))
  return assetsPromise
}

function statusOf(game, thinking) {
  if (game.isCheckmate()) return game.turn() === 'w' ? 'Checkmate — Black Wins' : 'Checkmate — White Wins'
  if (game.isStalemate()) return 'Stalemate'
  if (game.isDraw()) return 'Draw'
  if (thinking) return 'Black to Move'
  return `${game.turn() === 'w' ? 'White' : 'Black'} to Move${game.inCheck() ? ' — Check' : ''}`
}

export default function ChessWindow() {
  const isOpen = useWindowStore((s) => s.windows.find((w) => w.id === 'chess')?.isOpen)
  const { game, version, gameNo, thinking, hint, level } = useChessStore()
  const move = useChessStore((s) => s.move)
  const setThinking = useChessStore((s) => s.setThinking)

  const mountRef = useRef(null)
  const three = useRef(null)          // renderer, scene, camera, pieces, markers
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState(null)
  const worker = useRef(null)

  // ── Scene: built once while the window is open ──
  useEffect(() => {
    if (!isOpen || !mountRef.current) return
    const el = mountRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    // Behind White, raised, looking down the board — the real app's view.
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 1000)
    camera.position.set(0, 112, 118)
    camera.lookAt(0, -2, 4)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x5a5048, 1.6))
    const key = new THREE.DirectionalLight(0xffffff, 2.6)
    key.position.set(-40, 140, 80)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    Object.assign(key.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 400 })
    key.shadow.bias = -0.0005
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.6)
    fill.position.set(60, 60, -40)
    scene.add(fill)

    const group = new THREE.Group()
    scene.add(group)
    const markers = new THREE.Group()
    scene.add(markers)

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      // Keep the whole board in view whatever the window's shape.
      camera.fov = w / h < 1.25 ? 30 * (1.25 / (w / h)) : 30
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    let raf
    const loop = () => {
      const now = performance.now()
      for (const p of group.children) {
        const a = p.userData.anim
        if (!a) continue
        const t = Math.min(1, (now - a.start) / a.dur)
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        p.position.x = a.from[0] + (a.to[0] - a.from[0]) * e
        p.position.z = a.from[1] + (a.to[1] - a.from[1]) * e
        // Pieces are lifted and set down, not slid along the cloth.
        p.position.y = Math.sin(Math.PI * t) * a.lift
        if (t === 1) p.userData.anim = null
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    loop()

    three.current = { renderer, scene, camera, group, markers, materials: null }
    // Test hook, development builds only: lets automated checks project squares to the screen.
    if (import.meta.env.DEV) window.__chess3 = { camera, el: renderer.domElement, V: THREE.Vector3 }

    loadAssets().then((A) => {
      const board = new THREE.Mesh(A.boardGeo, new THREE.MeshStandardMaterial({ map: A.boardTex, roughness: 0.55, metalness: 0 }))
      board.receiveShadow = true
      scene.add(board)
      three.current.materials = {
        w: Object.fromEntries(TYPES.map((t) => [t, new THREE.MeshStandardMaterial({ map: A.whiteTex, normalMap: A.normal[t], roughness: 0.45, metalness: 0 })])),
        b: Object.fromEntries(TYPES.map((t) => [t, new THREE.MeshStandardMaterial({ map: A.blackTex, normalMap: A.normal[t], roughness: 0.4, metalness: 0 })])),
      }
      three.current.geo = A.geo
      setReady(true)
    })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      el.removeChild(renderer.domElement)
      three.current = null
      setReady(false)
    }
  }, [isOpen])

  // ── Pieces: re-laid from the game whenever it changes ──
  const lastFen = useRef(null)
  useEffect(() => {
    const T = three.current
    if (!ready || !T?.materials) return
    const prev = lastFen.current ? new Map(T.group.children.map((m) => [m.userData.sq, m])) : null
    const hist = game.history({ verbose: true })
    const last = hist[hist.length - 1]
    // Rebuild the set, then animate the piece that just moved from its old square.
    T.group.clear()
    for (const row of game.board()) {
      for (const cell of row) {
        if (!cell) continue
        const type = CODE[cell.type]
        const mesh = new THREE.Mesh(T.geo[type], T.materials[cell.color][type])
        mesh.castShadow = true
        const [x, z] = sqToXZ(cell.square)
        mesh.position.set(x, 0, z)
        // Knights face the opponent.
        if (cell.color === 'b') mesh.rotation.y = Math.PI
        mesh.userData.sq = cell.square
        if (last && cell.square === last.to && prev && lastFen.current !== game.fen()) {
          const from = sqToXZ(last.from)
          mesh.position.set(from[0], 0, from[1])
          mesh.userData.anim = { from, to: [x, z], start: performance.now(), dur: 420, lift: type === 'knight' ? 9 : 3 }
        }
        T.group.add(mesh)
      }
    }
    lastFen.current = game.fen()
  }, [ready, version, gameNo])

  // ── Selection, legal moves, hint and last move, drawn on the board ──
  useEffect(() => {
    const T = three.current
    if (!ready || !T) return
    T.markers.clear()
    const tile = (sq, color, opacity, size = 10) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }))
      m.rotation.x = -Math.PI / 2
      const [x, z] = sqToXZ(sq)
      m.position.set(x, 0.06, z)
      T.markers.add(m)
    }
    const dot = (sq, color) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(1.8, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false }))
      m.rotation.x = -Math.PI / 2
      const [x, z] = sqToXZ(sq)
      m.position.set(x, 0.08, z)
      T.markers.add(m)
    }
    const hist = game.history({ verbose: true })
    const last = hist[hist.length - 1]
    if (last) { tile(last.from, 0xffd60a, 0.18); tile(last.to, 0xffd60a, 0.26) }
    if (game.inCheck()) {
      const king = game.board().flat().find((c) => c && c.type === 'k' && c.color === game.turn())
      if (king) tile(king.square, 0xff453a, 0.45)
    }
    if (hint) { tile(hint.from, 0x30d158, 0.4); tile(hint.to, 0x30d158, 0.4) }
    if (selected) {
      tile(selected, 0x0a84ff, 0.45)
      for (const m of game.moves({ square: selected, verbose: true })) {
        if (m.captured) tile(m.to, 0x0a84ff, 0.3)
        else dot(m.to, 0x0a84ff)
      }
    }
  }, [ready, version, selected, hint])

  // ── The computer's turn ──
  useEffect(() => {
    if (!isOpen || game.turn() !== 'b' || game.isGameOver()) return
    if (!worker.current) worker.current = new Worker(new URL('../../utils/chessEngine.worker.js', import.meta.url), { type: 'module' })
    const w = worker.current
    const fen = game.fen()
    setThinking(true)
    const started = Date.now()
    w.onmessage = ({ data }) => {
      // Never answer instantly — a beat of "thinking" reads as an opponent.
      setTimeout(() => {
        if (useChessStore.getState().game.fen() !== fen) return
        if (data.move) move(data.move)
        setThinking(false)
      }, Math.max(0, 500 - (Date.now() - started)))
    }
    w.postMessage({ fen, depth: level })
  }, [isOpen, version, gameNo])

  useEffect(() => () => worker.current?.terminate(), [])
  useEffect(() => { setSelected(null) }, [gameNo])

  // ── Clicking the board ──
  const onClick = (e) => {
    const T = three.current
    if (!T || thinking || game.turn() !== 'w' || game.isGameOver()) return
    const r = T.renderer.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    const ray = new THREE.Raycaster()
    ray.setFromCamera(ndc, T.camera)
    // The square on the board under the pointer.
    const p = new THREE.Vector3()
    const boardSq = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p) ? xzToSq(p.x, p.z) : null
    /* With a piece picked up, a click on one of its target squares makes the
       move even where a nearer piece's outline overlaps that square — from
       this angle the front pieces cover the squares behind them. */
    if (selected && boardSq && game.moves({ square: selected, verbose: true }).some((m) => m.to === boardSq)) {
      move({ from: selected, to: boardSq, promotion: 'q' })
      setSelected(null)
      return
    }
    // Otherwise a piece under the pointer wins over the square behind it.
    const hitPiece = ray.intersectObjects(T.group.children)[0]
    const sq = hitPiece?.object.userData.sq ?? boardSq
    if (!sq) { setSelected(null); return }
    const piece = game.get(sq)
    if (piece && piece.color === 'w') { setSelected(sq === selected ? null : sq); return }
    if (selected) {
      const legal = game.moves({ square: selected, verbose: true }).find((m) => m.to === sq)
      if (legal) move({ from: selected, to: sq, promotion: 'q' })
      setSelected(null)
    }
  }

  const title = `Game ${gameNo} | You – Computer   (${statusOf(game, thinking)})`

  return (
    <Window id="chess" title={title} minSize={{ width: 520, height: 420 }}>
      <div className="chess-stage" onClick={onClick}>
        <div ref={mountRef} className="chess-canvas" />
        {!ready && <p className="chess-loading">Setting up the board…</p>}
      </div>
    </Window>
  )
}
