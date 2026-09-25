/* ── macOS overlay scrollbars ───────────────────────────────────────────────
   With a trackpad, macOS draws no scrollbar at rest: it appears the moment
   something scrolls and fades out about a second after it stops. CSS alone
   can only show a bar always or on hover, so this marks whatever is
   scrolling with `is-scrolling` and clears it once the scrolling stops; the
   stylesheet shows the thumb only while the class is there.

   One capture-phase listener on the document hears every scroll area,
   windows and panels alike, without each component opting in.            */

const HIDE_AFTER = 900
const timers = new WeakMap()

document.addEventListener('scroll', (e) => {
  const el = e.target === document ? document.documentElement : e.target
  if (!(el instanceof Element)) return
  el.classList.add('is-scrolling')
  clearTimeout(timers.get(el))
  timers.set(el, setTimeout(() => el.classList.remove('is-scrolling'), HIDE_AFTER))
}, { capture: true, passive: true })
