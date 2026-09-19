/* ─────────────────────────────────────────────────────────────────────────────
   Stick-man UI animations — the Shop's stock
   ─────────────────────────────────────────────────────────────────────────────

   Each resource is one self-contained snippet: a `css` block of keyframes and
   an `html` block of markup. Both are plain HTML + Tailwind utility classes,
   which is exactly what a visitor copies out — `toHtmlFile()` wraps the pair in
   a document with the Tailwind CDN and it runs on its own, no build step.

   The same two strings drive the in-app preview: the markup is injected as-is
   and the keyframes are mounted once by the Shop window, so what a card plays
   is byte-for-byte what the copy button hands over. That only works because
   Tailwind scans this file (it is inside the `content` globs) and compiles every
   class named in these strings into the app's own stylesheet.

   House rules for adding one:
     • prefix every class and keyframe with the resource id (`sm-<id>-…`) —
       ten snippets share one document in the grid and must not collide
     • animate with `transform` / `opacity` only, and let it loop forever; the
       card pauses it by setting `animation-play-state` until you hover
     • SVG limbs rotate around a joint: `transform-box: view-box` plus a
       `transform-origin` in viewBox units
   ────────────────────────────────────────────────────────────────────────── */

/* Stage shared by every snippet: a fixed-ratio dark tile the figure lives in,
   so a card, the detail pane and the exported file all frame it identically. */
const STAGE = 'relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-950'

const resources = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    id: 'password-peek',
    title: 'Password Peek',
    blurb: 'He covers his eyes as the dots fill in, and peeks the moment you reveal.',
    tags: ['form', 'password'],
    category: 'Forms & controls',
    css: `
/* Password Peek */
.sm-peek-arm { transform-box: view-box; transform-origin: 60px 44px; }
.sm-peek-arm-l { animation: sm-peek-left 4.4s cubic-bezier(.5,0,.2,1) infinite; }
.sm-peek-arm-r { animation: sm-peek-right 4.4s cubic-bezier(.5,0,.2,1) infinite; }
.sm-peek-eye  { animation: sm-peek-shut 4.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.sm-peek-dot  { animation: sm-peek-fill 4.4s ease-in-out infinite; }
.sm-peek-dot:nth-child(1) { animation-delay: .10s }
.sm-peek-dot:nth-child(2) { animation-delay: .25s }
.sm-peek-dot:nth-child(3) { animation-delay: .40s }
.sm-peek-dot:nth-child(4) { animation-delay: .55s }
.sm-peek-dot:nth-child(5) { animation-delay: .70s }
.sm-peek-caret { animation: sm-peek-blink 1s steps(1) infinite; }

@keyframes sm-peek-left  { 0%,14% { transform: rotate(0) } 26%,74% { transform: rotate(-46deg) } 86%,100% { transform: rotate(0) } }
@keyframes sm-peek-right { 0%,14% { transform: rotate(0) } 26%,74% { transform: rotate(46deg) }  86%,100% { transform: rotate(0) } }
@keyframes sm-peek-shut  { 0%,20% { transform: scaleY(1) } 30%,72% { transform: scaleY(.12) } 82%,100% { transform: scaleY(1) } }
@keyframes sm-peek-fill  { 0%,4% { transform: scale(0); opacity: 0 } 16%,76% { transform: scale(1); opacity: 1 } 88%,100% { transform: scale(0); opacity: 0 } }
@keyframes sm-peek-blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }`,
    html: `<div class="${STAGE}">
  <div class="flex flex-col items-center gap-6">

    <!-- the figure -->
    <svg viewBox="0 0 120 92" class="w-28 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <circle cx="60" cy="26" r="11" />
      <ellipse class="sm-peek-eye" cx="56" cy="25" rx="1.6" ry="1.6" fill="currentColor" stroke="none" />
      <ellipse class="sm-peek-eye" cx="64" cy="25" rx="1.6" ry="1.6" fill="currentColor" stroke="none" />
      <path d="M60 37 V63" />
      <path d="M60 63 L50 82" />
      <path d="M60 63 L70 82" />
      <g class="sm-peek-arm sm-peek-arm-l"><path d="M60 44 L43 55" /></g>
      <g class="sm-peek-arm sm-peek-arm-r"><path d="M60 44 L77 55" /></g>
    </svg>

    <!-- the field he is not looking at -->
    <div class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <span class="sm-peek-dot h-2 w-2 rounded-full bg-neutral-300"></span>
      <span class="sm-peek-dot h-2 w-2 rounded-full bg-neutral-300"></span>
      <span class="sm-peek-dot h-2 w-2 rounded-full bg-neutral-300"></span>
      <span class="sm-peek-dot h-2 w-2 rounded-full bg-neutral-300"></span>
      <span class="sm-peek-dot h-2 w-2 rounded-full bg-neutral-300"></span>
      <span class="sm-peek-caret ml-1 h-4 w-[2px] rounded-full bg-emerald-400"></span>
    </div>

  </div>
</div>`,
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    id: 'download-catch',
    title: 'Download Catch',
    blurb: 'A file drops out of the cloud and he catches it — the bar fills as it lands.',
    tags: ['download', 'progress'],
    category: 'Transfer',
    css: `
/* Download Catch */
.sm-catch-file { transform-box: fill-box; transform-origin: center; animation: sm-catch-drop 3.2s cubic-bezier(.55,.05,.35,1) infinite; }
.sm-catch-arm  { transform-box: view-box; transform-origin: 60px 46px; }
.sm-catch-arm-l { animation: sm-catch-lift-l 3.2s ease-in-out infinite; }
.sm-catch-arm-r { animation: sm-catch-lift-r 3.2s ease-in-out infinite; }
.sm-catch-body { transform-box: view-box; transform-origin: 60px 88px; animation: sm-catch-brace 3.2s ease-in-out infinite; }
.sm-catch-bar  { animation: sm-catch-fill 3.2s cubic-bezier(.4,0,.2,1) infinite; }
.sm-catch-cloud { animation: sm-catch-drift 6.4s ease-in-out infinite; }

@keyframes sm-catch-drop   { 0% { transform: translateY(-6px); opacity: 0 } 8% { opacity: 1 } 54% { transform: translateY(42px) } 62% { transform: translateY(39px) scaleY(.88) } 70% { transform: translateY(40px) } 80%,100% { transform: translateY(40px) scale(.7); opacity: 0 } }
@keyframes sm-catch-lift-l { 0%,18% { transform: rotate(0) } 44%,72% { transform: rotate(-24deg) } 88%,100% { transform: rotate(0) } }
@keyframes sm-catch-lift-r { 0%,18% { transform: rotate(0) } 44%,72% { transform: rotate(24deg) }  88%,100% { transform: rotate(0) } }
@keyframes sm-catch-brace  { 0%,50% { transform: scaleY(1) } 60% { transform: scaleY(.94) } 70%,100% { transform: scaleY(1) } }
@keyframes sm-catch-fill   { 0%,10% { width: 0% } 62%,84% { width: 100% } 92%,100% { width: 0% } }
@keyframes sm-catch-drift  { 0%,100% { transform: translateX(-3px) } 50% { transform: translateX(3px) } }`,
    html: `<div class="${STAGE}">
  <div class="flex w-48 flex-col items-center">

    <svg viewBox="0 0 120 118" class="w-32 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <!-- cloud -->
      <g class="sm-catch-cloud" stroke="rgb(255 255 255 / .28)">
        <path d="M44 15 a9 9 0 0 1 17-4 a11 11 0 0 1 20 5 a8 8 0 0 1-1 15 H46 a8 8 0 0 1-2-16 z" />
      </g>
      <!-- the falling file -->
      <g class="sm-catch-file" stroke="rgb(52 211 153)">
        <rect x="52" y="30" width="16" height="20" rx="2.5" />
        <path d="M56 38 h8 M56 43 h8" stroke-width="2" />
      </g>
      <!-- figure -->
      <circle cx="60" cy="62" r="10" />
      <path d="M60 72 V92" />
      <path d="M60 92 L51 108" />
      <g class="sm-catch-body"><path d="M60 92 L69 108" /></g>
      <g class="sm-catch-arm sm-catch-arm-l"><path d="M60 78 L45 88" /></g>
      <g class="sm-catch-arm sm-catch-arm-r"><path d="M60 78 L75 88" /></g>
    </svg>

    <!-- progress -->
    <div class="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
      <div class="sm-catch-bar h-full w-0 rounded-full bg-emerald-400"></div>
    </div>
    <p class="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">downloading</p>

  </div>
</div>`,
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    id: 'upload-toss',
    title: 'Upload Toss',
    blurb: 'He lobs the box skyward and the cloud swallows it whole.',
    tags: ['upload', 'cloud'],
    category: 'Transfer',
    css: `
/* Upload Toss */
.sm-toss-box  { transform-box: fill-box; transform-origin: center; animation: sm-toss-arc 3.4s cubic-bezier(.3,0,.5,1) infinite; }
.sm-toss-arm  { transform-box: view-box; transform-origin: 60px 74px; animation: sm-toss-swing 3.4s cubic-bezier(.3,0,.4,1) infinite; }
.sm-toss-lean { transform-box: view-box; transform-origin: 60px 104px; animation: sm-toss-lean 3.4s ease-in-out infinite; }
.sm-toss-cloud { animation: sm-toss-pulse 3.4s ease-in-out infinite; }
.sm-toss-spark { animation: sm-toss-spark 3.4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
.sm-toss-spark:nth-of-type(2) { animation-delay: .06s }
.sm-toss-spark:nth-of-type(3) { animation-delay: .12s }

@keyframes sm-toss-arc   { 0%,20% { transform: translate(0,0) rotate(0); opacity: 1 } 62% { transform: translate(2px,-44px) rotate(190deg); opacity: 1 } 76%,100% { transform: translate(2px,-50px) rotate(220deg); opacity: 0 } }
@keyframes sm-toss-swing { 0%,18% { transform: rotate(18deg) } 34% { transform: rotate(-64deg) } 58%,100% { transform: rotate(18deg) } }
@keyframes sm-toss-lean  { 0%,18% { transform: rotate(4deg) } 34% { transform: rotate(-5deg) } 58%,100% { transform: rotate(4deg) } }
@keyframes sm-toss-pulse { 0%,58% { stroke: rgb(255 255 255 / .28) } 70% { stroke: rgb(129 140 248) } 86%,100% { stroke: rgb(255 255 255 / .28) } }
@keyframes sm-toss-spark { 0%,64% { transform: scale(0); opacity: 0 } 74% { transform: scale(1); opacity: 1 } 92%,100% { transform: scale(1.4); opacity: 0 } }`,
    html: `<div class="${STAGE}">
  <div class="flex flex-col items-center">

    <svg viewBox="0 0 120 124" class="w-32 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <!-- cloud that lights up on arrival -->
      <g class="sm-toss-cloud" stroke="rgb(255 255 255 / .28)">
        <path d="M42 22 a9 9 0 0 1 17-4 a11 11 0 0 1 20 5 a8 8 0 0 1-1 15 H44 a8 8 0 0 1-2-16 z" />
      </g>
      <circle class="sm-toss-spark" cx="46" cy="16" r="1.6" fill="rgb(129 140 248)" stroke="none" />
      <circle class="sm-toss-spark" cx="74" cy="13" r="1.6" fill="rgb(129 140 248)" stroke="none" />
      <circle class="sm-toss-spark" cx="60" cy="8"  r="1.6" fill="rgb(129 140 248)" stroke="none" />

      <!-- the parcel -->
      <g class="sm-toss-box" stroke="rgb(129 140 248)">
        <rect x="52" y="52" width="17" height="15" rx="2.5" />
        <path d="M52 58 h17" stroke-width="2" />
      </g>

      <!-- figure -->
      <g class="sm-toss-lean">
        <circle cx="60" cy="86" r="10" />
        <path d="M60 96 V108" />
        <path d="M60 108 L50 122" />
        <path d="M60 108 L70 122" />
        <path d="M60 99 L46 106" />
        <g class="sm-toss-arm"><path d="M60 74 L60 56" stroke-width="3" /></g>
      </g>
    </svg>

    <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">uploading</p>

  </div>
</div>`,
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    id: 'treadmill-loader',
    title: 'Treadmill Loader',
    blurb: 'He runs and the floor runs under him — a loader that never arrives.',
    tags: ['loader', 'progress'],
    category: 'Loaders',
    css: `
/* Treadmill Loader */
.sm-run-leg-l  { transform-box: view-box; transform-origin: 60px 66px; animation: sm-run-leg-a .62s cubic-bezier(.45,0,.55,1) infinite; }
.sm-run-leg-r  { transform-box: view-box; transform-origin: 60px 66px; animation: sm-run-leg-b .62s cubic-bezier(.45,0,.55,1) infinite; }
.sm-run-arm-l  { transform-box: view-box; transform-origin: 60px 48px; animation: sm-run-arm-a .62s cubic-bezier(.45,0,.55,1) infinite; }
.sm-run-arm-r  { transform-box: view-box; transform-origin: 60px 48px; animation: sm-run-arm-b .62s cubic-bezier(.45,0,.55,1) infinite; }
.sm-run-body   { transform-box: view-box; transform-origin: 60px 86px; animation: sm-run-bob .31s ease-in-out infinite alternate; }
.sm-run-floor  { stroke-dasharray: 10 8; animation: sm-run-floor .62s linear infinite; }
.sm-run-dot    { animation: sm-run-dot 1.2s ease-in-out infinite; }
.sm-run-dot:nth-child(2) { animation-delay: .15s }
.sm-run-dot:nth-child(3) { animation-delay: .3s }

@keyframes sm-run-leg-a { 0%,100% { transform: rotate(26deg) } 50% { transform: rotate(-26deg) } }
@keyframes sm-run-leg-b { 0%,100% { transform: rotate(-26deg) } 50% { transform: rotate(26deg) } }
@keyframes sm-run-arm-a { 0%,100% { transform: rotate(-34deg) } 50% { transform: rotate(30deg) } }
@keyframes sm-run-arm-b { 0%,100% { transform: rotate(30deg) } 50% { transform: rotate(-34deg) } }
@keyframes sm-run-bob   { from { transform: translateY(0) } to { transform: translateY(-2.5px) } }
@keyframes sm-run-floor { to { stroke-dashoffset: -18 } }
@keyframes sm-run-dot   { 0%,100% { opacity: .25; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-3px) } }`,
    html: `<div class="${STAGE}">
  <div class="flex flex-col items-center gap-4">

    <svg viewBox="0 0 120 100" class="w-32 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <g class="sm-run-body">
        <circle cx="60" cy="24" r="10" />
        <path d="M60 34 V66" />
        <g class="sm-run-arm-l"><path d="M60 48 L45 58" /></g>
        <g class="sm-run-arm-r"><path d="M60 48 L75 58" /></g>
        <g class="sm-run-leg-l"><path d="M60 66 L52 86" /></g>
        <g class="sm-run-leg-r"><path d="M60 66 L68 86" /></g>
      </g>
      <!-- the floor sliding backwards -->
      <path class="sm-run-floor" d="M14 90 H106" stroke="rgb(255 255 255 / .3)" stroke-width="3" />
    </svg>

    <div class="flex items-center gap-1.5">
      <span class="sm-run-dot h-1.5 w-1.5 rounded-full bg-amber-400"></span>
      <span class="sm-run-dot h-1.5 w-1.5 rounded-full bg-amber-400"></span>
      <span class="sm-run-dot h-1.5 w-1.5 rounded-full bg-amber-400"></span>
      <span class="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">loading</span>
    </div>

  </div>
</div>`,
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    id: 'success-leap',
    title: 'Success Leap',
    blurb: 'The tick draws itself, he jumps, and the ring snaps shut behind him.',
    tags: ['success', 'confirm'],
    category: 'Feedback',
    css: `
/* Success Leap */
.sm-win-ring  { stroke-dasharray: 226; stroke-dashoffset: 226; animation: sm-win-ring 3s cubic-bezier(.4,0,.2,1) infinite; }
.sm-win-check { stroke-dasharray: 22; stroke-dashoffset: 22; animation: sm-win-check 3s cubic-bezier(.4,0,.2,1) infinite; }
.sm-win-hop   { transform-box: view-box; transform-origin: 60px 96px; animation: sm-win-hop 3s cubic-bezier(.3,0,.3,1) infinite; }
.sm-win-arm-l { transform-box: view-box; transform-origin: 60px 74px; animation: sm-win-arm-l 3s cubic-bezier(.3,0,.3,1) infinite; }
.sm-win-arm-r { transform-box: view-box; transform-origin: 60px 74px; animation: sm-win-arm-r 3s cubic-bezier(.3,0,.3,1) infinite; }
.sm-win-shadow { transform-box: fill-box; transform-origin: center; animation: sm-win-shadow 3s cubic-bezier(.3,0,.3,1) infinite; }

@keyframes sm-win-ring   { 0%,6% { stroke-dashoffset: 226 } 42%,88% { stroke-dashoffset: 0 } 100% { stroke-dashoffset: 226 } }
@keyframes sm-win-check  { 0%,30% { stroke-dashoffset: 22 } 52%,88% { stroke-dashoffset: 0 } 100% { stroke-dashoffset: 22 } }
@keyframes sm-win-hop    { 0%,48% { transform: translateY(0) } 62% { transform: translateY(-13px) } 76%,100% { transform: translateY(0) } }
@keyframes sm-win-arm-l  { 0%,48% { transform: rotate(0) } 62%,80% { transform: rotate(-58deg) } 94%,100% { transform: rotate(0) } }
@keyframes sm-win-arm-r  { 0%,48% { transform: rotate(0) } 62%,80% { transform: rotate(58deg) }  94%,100% { transform: rotate(0) } }
@keyframes sm-win-shadow { 0%,48% { transform: scaleX(1); opacity: .5 } 62% { transform: scaleX(.6); opacity: .22 } 76%,100% { transform: scaleX(1); opacity: .5 } }`,
    html: `<div class="${STAGE}">
  <div class="flex flex-col items-center">

    <svg viewBox="0 0 120 112" class="w-32 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <!-- the ring closes around him, the tick lands as a pip beside it -->
      <circle class="sm-win-ring" cx="60" cy="56" r="34" stroke="rgb(52 211 153 / .5)" stroke-width="2.5" />
      <circle cx="94" cy="26" r="12" fill="rgb(16 185 129 / .16)" stroke="rgb(52 211 153 / .45)" stroke-width="2" />
      <path class="sm-win-check" d="M88 26 L93 31 L101 21" stroke="rgb(52 211 153)" stroke-width="3.5" />

      <!-- figure -->
      <g class="sm-win-hop">
        <circle cx="60" cy="56" r="9" />
        <path d="M60 65 V84" />
        <path d="M60 84 L51 98" />
        <path d="M60 84 L69 98" />
        <g class="sm-win-arm-l"><path d="M60 70 L47 79" /></g>
        <g class="sm-win-arm-r"><path d="M60 70 L73 79" /></g>
      </g>
      <ellipse class="sm-win-shadow" cx="60" cy="103" rx="15" ry="2.6" fill="rgb(255 255 255 / .18)" stroke="none" />
    </svg>

    <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">all done</p>

  </div>
</div>`,
  },
  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    id: 'error-tumble',
    title: '404 Tumble',
    blurb: 'He trips over the missing page, lands flat, and the 404 wobbles.',
    tags: ['404', 'error'],
    category: 'Feedback',
    css: `
/* 404 Tumble */
.sm-trip-body  { transform-box: view-box; transform-origin: 60px 92px; animation: sm-trip-fall 4s cubic-bezier(.45,0,.35,1) infinite; }
.sm-trip-leg-l { transform-box: view-box; transform-origin: 60px 74px; animation: sm-trip-step 4s cubic-bezier(.45,0,.35,1) infinite; }
.sm-trip-leg-r { transform-box: view-box; transform-origin: 60px 74px; animation: sm-trip-snag 4s cubic-bezier(.45,0,.35,1) infinite; }
.sm-trip-arm   { transform-box: view-box; transform-origin: 60px 56px; animation: sm-trip-flail 4s cubic-bezier(.45,0,.35,1) infinite; }
.sm-trip-rock  { transform-box: fill-box; transform-origin: center; animation: sm-trip-rock 4s cubic-bezier(.3,0,.3,1) infinite; }
.sm-trip-code  { animation: sm-trip-wobble 4s ease-in-out infinite; }

@keyframes sm-trip-fall   { 0%,34% { transform: rotate(0) } 46% { transform: rotate(16deg) } 58%,88% { transform: rotate(84deg) translateY(6px) } 96%,100% { transform: rotate(0) } }
@keyframes sm-trip-step   { 0%,20% { transform: rotate(-18deg) } 34%,100% { transform: rotate(14deg) } }
@keyframes sm-trip-snag   { 0%,20% { transform: rotate(18deg) } 34% { transform: rotate(-30deg) } 58%,100% { transform: rotate(-8deg) } }
@keyframes sm-trip-flail  { 0%,30% { transform: rotate(0) } 44% { transform: rotate(70deg) } 60%,88% { transform: rotate(24deg) } 96%,100% { transform: rotate(0) } }
@keyframes sm-trip-rock   { 0%,40% { transform: translateY(0) rotate(0) } 50% { transform: translateY(-3px) rotate(18deg) } 62%,100% { transform: translateY(0) rotate(6deg) } }
@keyframes sm-trip-wobble { 0%,44% { transform: translateY(0); opacity: .35 } 56% { transform: translateY(-4px); opacity: 1 } 70%,100% { transform: translateY(0); opacity: .75 } }`,
    html: `<div class="${STAGE}">
  <div class="flex flex-col items-center">

    <p class="sm-trip-code font-mono text-3xl font-semibold tracking-[0.18em] text-rose-400">404</p>

    <svg viewBox="0 0 120 108" class="-mt-1 w-32 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <g class="sm-trip-body">
        <circle cx="60" cy="44" r="10" />
        <path d="M60 54 V74" />
        <g class="sm-trip-arm"><path d="M60 56 L44 66" /></g>
        <path d="M60 56 L76 66" />
        <g class="sm-trip-leg-l"><path d="M60 74 L50 92" /></g>
        <g class="sm-trip-leg-r"><path d="M60 74 L70 92" /></g>
      </g>
      <!-- the thing he did not see -->
      <path class="sm-trip-rock" d="M72 92 l6-8 l7 8 z" fill="rgb(244 63 94 / .35)" stroke="rgb(244 63 94)" stroke-width="2" stroke-linejoin="round" />
      <path d="M12 92 H108" stroke="rgb(255 255 255 / .22)" stroke-width="2.5" />
    </svg>

    <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">page not found</p>

  </div>
</div>`,
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    id: 'empty-sweep',
    title: 'Empty Sweep',
    blurb: 'Nothing here yet — so he sweeps the box out while you decide.',
    tags: ['empty state', 'list'],
    category: 'Empty states',
    css: `
/* Empty Sweep */
.sm-sweep-broom { transform-box: view-box; transform-origin: 46px 60px; animation: sm-sweep-swing 2.2s ease-in-out infinite; }
.sm-sweep-body  { transform-box: view-box; transform-origin: 30px 96px; animation: sm-sweep-lean 2.2s ease-in-out infinite; }
.sm-sweep-dust  { animation: sm-sweep-dust 2.2s ease-out infinite; transform-box: fill-box; transform-origin: center; }
.sm-sweep-dust:nth-of-type(2) { animation-delay: .12s }
.sm-sweep-dust:nth-of-type(3) { animation-delay: .24s }
.sm-sweep-box   { animation: sm-sweep-breathe 4.4s ease-in-out infinite; }

@keyframes sm-sweep-swing   { 0%,100% { transform: rotate(-14deg) } 50% { transform: rotate(16deg) } }
@keyframes sm-sweep-lean    { 0%,100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }
@keyframes sm-sweep-dust    { 0%,40% { transform: translate(0,0) scale(0); opacity: 0 } 60% { transform: translate(6px,-7px) scale(1); opacity: .9 } 100% { transform: translate(14px,-12px) scale(.5); opacity: 0 } }
@keyframes sm-sweep-breathe { 0%,100% { stroke: rgb(255 255 255 / .18) } 50% { stroke: rgb(255 255 255 / .34) } }`,
    html: `<div class="${STAGE}">
  <div class="flex flex-col items-center">

    <svg viewBox="0 0 120 108" class="w-32 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <!-- the empty container, off to one side so he has room to work -->
      <g class="sm-sweep-box" stroke="rgb(255 255 255 / .18)" stroke-width="2.5">
        <path d="M58 52 h46 v42 h-46 z" stroke-dasharray="6 6" />
      </g>

      <!-- dust he stirs up -->
      <circle class="sm-sweep-dust" cx="70" cy="88" r="2" fill="rgb(255 255 255 / .5)" stroke="none" />
      <circle class="sm-sweep-dust" cx="75" cy="85" r="1.5" fill="rgb(255 255 255 / .4)" stroke="none" />
      <circle class="sm-sweep-dust" cx="66" cy="90" r="1.5" fill="rgb(255 255 255 / .4)" stroke="none" />

      <g class="sm-sweep-body">
        <circle cx="30" cy="52" r="9" />
        <path d="M30 61 V78" />
        <path d="M30 78 L22 96" />
        <path d="M30 78 L38 96" />
        <path d="M30 66 L46 60" />
        <!-- broom -->
        <g class="sm-sweep-broom" stroke="rgb(251 191 36)">
          <path d="M46 60 L60 84" />
          <path d="M54 82 l12 -6 l4 8 l-12 6 z" fill="rgb(251 191 36 / .22)" stroke-width="2.5" />
        </g>
      </g>
      <path d="M12 96 H108" stroke="rgb(255 255 255 / .22)" stroke-width="2.5" />
    </svg>

    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">nothing here yet</p>

  </div>
</div>`,
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    id: 'search-hunt',
    title: 'Search Hunt',
    blurb: 'He paces the line with a glass, and the lens catches the light each pass.',
    tags: ['search', 'empty results'],
    category: 'Empty states',
    css: `
/* Search Hunt */
.sm-hunt-walk  { transform-box: view-box; transform-origin: 60px 50px; animation: sm-hunt-pace 5s cubic-bezier(.45,0,.55,1) infinite; }
.sm-hunt-leg-l { transform-box: view-box; transform-origin: 56px 72px; animation: sm-hunt-step-a .72s cubic-bezier(.45,0,.55,1) infinite; }
.sm-hunt-leg-r { transform-box: view-box; transform-origin: 56px 72px; animation: sm-hunt-step-b .72s cubic-bezier(.45,0,.55,1) infinite; }
.sm-hunt-glass { transform-box: view-box; transform-origin: 56px 56px; animation: sm-hunt-scan 2.5s ease-in-out infinite; }
.sm-hunt-glint { animation: sm-hunt-glint 2.5s ease-in-out infinite; }
.sm-hunt-line  { animation: sm-hunt-line 2.5s ease-in-out infinite; }
.sm-hunt-line:nth-child(2) { animation-delay: .2s }
.sm-hunt-line:nth-child(3) { animation-delay: .4s }

@keyframes sm-hunt-pace   { 0%,100% { transform: translateX(-16px) } 48%,52% { transform: translateX(16px) scaleX(-1) } }
@keyframes sm-hunt-step-a { 0%,100% { transform: rotate(20deg) } 50% { transform: rotate(-20deg) } }
@keyframes sm-hunt-step-b { 0%,100% { transform: rotate(-20deg) } 50% { transform: rotate(20deg) } }
@keyframes sm-hunt-scan   { 0%,100% { transform: rotate(-12deg) } 50% { transform: rotate(14deg) } }
@keyframes sm-hunt-glint  { 0%,44% { opacity: 0 } 56% { opacity: .95 } 70%,100% { opacity: 0 } }
@keyframes sm-hunt-line   { 0%,100% { opacity: .18; transform: scaleX(.86) } 50% { opacity: .5; transform: scaleX(1) } }`,
    html: `<div class="${STAGE}">
  <div class="flex w-44 flex-col items-center gap-4">

    <svg viewBox="0 0 120 100" class="w-32 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <g class="sm-hunt-walk">
        <circle cx="56" cy="30" r="9" />
        <path d="M56 39 V72" />
        <path d="M56 50 L44 60" />
        <g class="sm-hunt-leg-l"><path d="M56 72 L48 90" /></g>
        <g class="sm-hunt-leg-r"><path d="M56 72 L64 90" /></g>
        <!-- magnifier -->
        <g class="sm-hunt-glass">
          <path d="M56 50 L70 46" />
          <circle cx="79" cy="42" r="9" stroke="rgb(56 189 248)" />
          <path d="M85 49 L92 57" stroke="rgb(56 189 248)" />
          <path class="sm-hunt-glint" d="M75 38 L82 45" stroke="rgb(224 242 254)" stroke-width="2" />
        </g>
      </g>
      <path d="M14 92 H106" stroke="rgb(255 255 255 / .22)" stroke-width="2.5" />
    </svg>

    <!-- the results he has not found -->
    <div class="flex w-full flex-col gap-1.5">
      <span class="sm-hunt-line h-1.5 w-full origin-left rounded-full bg-white/25"></span>
      <span class="sm-hunt-line h-1.5 w-4/5 origin-left rounded-full bg-white/25"></span>
      <span class="sm-hunt-line h-1.5 w-2/3 origin-left rounded-full bg-white/25"></span>
    </div>

  </div>
</div>`,
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    id: 'trash-toss',
    title: 'Trash Toss',
    blurb: 'Crumple, arc, swish — the lid flips shut behind the shot.',
    tags: ['delete', 'trash'],
    category: 'Feedback',
    css: `
/* Trash Toss */
.sm-bin-ball { transform-box: fill-box; transform-origin: center; animation: sm-bin-arc 3.2s cubic-bezier(.35,0,.5,1) infinite; }
.sm-bin-arm  { transform-box: view-box; transform-origin: 40px 56px; animation: sm-bin-throw 3.2s cubic-bezier(.3,0,.4,1) infinite; }
.sm-bin-lean { transform-box: view-box; transform-origin: 40px 92px; animation: sm-bin-lean 3.2s ease-in-out infinite; }
.sm-bin-lid  { transform-box: view-box; transform-origin: 74px 56px; animation: sm-bin-lid 3.2s cubic-bezier(.3,0,.3,1) infinite; }
.sm-bin-body { transform-box: view-box; transform-origin: 88px 92px; animation: sm-bin-thud 3.2s cubic-bezier(.3,0,.3,1) infinite; }

@keyframes sm-bin-arc   { 0%,22% { transform: translate(0,0) rotate(0); opacity: 1 } 40% { transform: translate(24px,-26px) rotate(180deg) } 56% { transform: translate(48px,-2px) rotate(340deg) } 62%,100% { transform: translate(48px,10px) rotate(360deg); opacity: 0 } }
@keyframes sm-bin-throw { 0%,18% { transform: rotate(22deg) } 32% { transform: rotate(-58deg) } 56%,100% { transform: rotate(22deg) } }
@keyframes sm-bin-lean  { 0%,18% { transform: rotate(0) } 32% { transform: rotate(-6deg) } 56%,100% { transform: rotate(0) } }
@keyframes sm-bin-lid   { 0%,44% { transform: rotate(0) } 54% { transform: rotate(-26deg) translateY(-2px) } 68%,100% { transform: rotate(0) } }
@keyframes sm-bin-thud  { 0%,56% { transform: scaleY(1) } 64% { transform: scaleY(.93) } 74%,100% { transform: scaleY(1) } }`,
    html: `<div class="${STAGE}">
  <div class="flex flex-col items-center">

    <svg viewBox="0 0 120 104" class="w-36 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <!-- thrower -->
      <g class="sm-bin-lean">
        <circle cx="40" cy="36" r="9" />
        <path d="M40 45 V72" />
        <path d="M40 72 L32 90" />
        <path d="M40 72 L48 90" />
        <path d="M40 56 L28 64" />
        <g class="sm-bin-arm"><path d="M40 56 L52 48" /></g>
      </g>

      <!-- the crumpled thing -->
      <circle class="sm-bin-ball" cx="54" cy="46" r="5" fill="rgb(255 255 255 / .12)" stroke="rgb(248 113 113)" stroke-width="2.5" />

      <!-- the bin -->
      <g class="sm-bin-body" stroke="rgb(255 255 255 / .55)">
        <path class="sm-bin-lid" d="M74 56 H102" stroke-width="3.5" />
        <path d="M78 58 L81 90 h14 l3 -32" />
        <path d="M84 66 V82 M92 66 V82" stroke-width="2" stroke="rgb(255 255 255 / .3)" />
      </g>
      <path d="M14 90 H108" stroke="rgb(255 255 255 / .2)" stroke-width="2.5" />
    </svg>

    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">moved to trash</p>

  </div>
</div>`,
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    id: 'switch-push',
    title: 'Switch Push',
    blurb: 'He shoulders the knob the length of the track and the whole thing turns green.',
    tags: ['toggle', 'settings'],
    category: 'Forms & controls',
    css: `
/* Switch Push */
.sm-flip-knob  { animation: sm-flip-slide 3.6s cubic-bezier(.5,0,.2,1) infinite; }
.sm-flip-push  { animation: sm-flip-slide 3.6s cubic-bezier(.5,0,.2,1) infinite; }
.sm-flip-track { animation: sm-flip-track 3.6s cubic-bezier(.5,0,.2,1) infinite; }
.sm-flip-lean  { transform-box: view-box; transform-origin: 24px 84px; animation: sm-flip-lean 3.6s cubic-bezier(.5,0,.2,1) infinite; }
.sm-flip-leg   { transform-box: view-box; transform-origin: 24px 62px; animation: sm-flip-brace 3.6s cubic-bezier(.5,0,.2,1) infinite; }
.sm-flip-label-off { animation: sm-flip-off 3.6s steps(1) infinite; }
.sm-flip-label-on  { animation: sm-flip-on 3.6s steps(1) infinite; }

@keyframes sm-flip-slide { 0%,22% { transform: translateX(0) } 62%,88% { transform: translateX(46px) } 100% { transform: translateX(0) } }
@keyframes sm-flip-track { 0%,30% { background-color: rgb(255 255 255 / .12) } 60%,88% { background-color: rgb(16 185 129 / .5) } 100% { background-color: rgb(255 255 255 / .12) } }
@keyframes sm-flip-lean  { 0%,18% { transform: rotate(0) } 30%,84% { transform: rotate(10deg) } 96%,100% { transform: rotate(0) } }
@keyframes sm-flip-brace { 0%,18% { transform: rotate(0) } 30%,84% { transform: rotate(-18deg) } 96%,100% { transform: rotate(0) } }
@keyframes sm-flip-off   { 0%,52% { opacity: .8 } 53%,100% { opacity: .15 } }
@keyframes sm-flip-on    { 0%,52% { opacity: .15 } 53%,100% { opacity: 1 } }`,
    html: `<div class="${STAGE}">
  <div class="relative pb-[90px]">

    <!-- the switch -->
    <div class="sm-flip-track relative flex h-11 w-[104px] items-center rounded-full border border-white/10 p-1.5" style="background-color: rgb(255 255 255 / .12)">
      <div class="sm-flip-knob h-8 w-8 rounded-full bg-neutral-100 shadow-lg"></div>
      <div class="pointer-events-none absolute inset-0 flex items-center justify-between px-3.5 font-mono text-[9px] uppercase tracking-widest">
        <span class="sm-flip-label-off text-neutral-400">off</span>
        <span class="sm-flip-label-on text-emerald-100">on</span>
      </div>
    </div>

    <!-- the one doing the shoving, hands under the knob -->
    <div class="sm-flip-push absolute left-[-2px] top-[26px]">
      <svg viewBox="0 0 48 92" class="w-12 text-neutral-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
        <g class="sm-flip-lean">
          <circle cx="24" cy="30" r="9" />
          <path d="M24 39 V62" />
          <path d="M24 42 L14 24" />
          <path d="M24 42 L34 24" />
          <path d="M24 62 L15 84" />
          <g class="sm-flip-leg"><path d="M24 62 L33 84" /></g>
        </g>
        <path d="M2 86 H46" stroke="rgb(255 255 255 / .2)" stroke-width="2.5" />
      </svg>
    </div>

  </div>
</div>`,
  },
]

/* ── The file a visitor walks away with ──────────────────────────────────────
   One document, no build step: Tailwind's play CDN, the snippet's keyframes,
   the snippet's markup. What the card plays is what this file plays. */
export function toHtmlFile(res) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${res.title} — stick-man UI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${res.css}
  </style>
</head>
<body class="flex min-h-screen items-center justify-center bg-neutral-900 p-8">

  <div class="w-full max-w-sm">
${res.html.split('\n').map((l) => (l ? `    ${l}` : l)).join('\n')}
  </div>

</body>
</html>
`
}

/* The shelf's sections, in the order Finder lists them. A resource names its
   own `category`; this only fixes the running order. */
export const SHOP_CATEGORIES = [
  'Forms & controls',
  'Transfer',
  'Loaders',
  'Feedback',
  'Empty states',
]

/* Every snippet's keyframes in one blob — the Shop mounts this once so the
   grid can play ten animations without ten copies of the same <style>. */
export const allCss = resources.map((r) => r.css).join('\n')

export default resources
