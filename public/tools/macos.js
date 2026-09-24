/* ── macOS chrome for the embedded tools ──────────────────────────────────
   Every tool runs in an iframe inside a site window. This keeps it looking
   like part of that window rather than a web page dropped into one:

   • the tool takes the site's accent (Settings → Appearance) and the
     window's own background colour, read live from the parent page, and
     follows them — and dark mode — when they change;
   • sliders get their filled track: the part left of the knob is the
     accent, as an NSSlider draws it (CSS alone cannot know the value).

   Loaded last in each tool's <head>, beside macos.css.                    */
(function () {
  var root = document.documentElement

  function sync() {
    try {
      var p = window.parent.document.documentElement
      var cs = window.parent.getComputedStyle(p)
      var brand = cs.getPropertyValue('--brand').trim()
      var win = cs.getPropertyValue('--window-bg').trim()
      if (brand) root.style.setProperty('--mac-accent', brand)
      if (win) root.style.setProperty('--mac-window', win)
      root.classList.toggle('dark', p.classList.contains('dark'))
    } catch (e) { /* opened on its own, not framed: keep the defaults */ }
  }
  sync()
  try {
    new MutationObserver(sync).observe(window.parent.document.documentElement, {
      attributes: true, attributeFilter: ['class', 'style'],
    })
  } catch (e) {}

  function fill(el) {
    var min = +el.min || 0, max = +el.max || 100
    var pct = max > min ? ((+el.value - min) / (max - min)) * 100 : 0
    el.style.setProperty('--fill', pct + '%')
  }
  function fillAll() {
    document.querySelectorAll('input[type="range"]').forEach(fill)
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.type === 'range') fill(e.target)
  }, true)
  document.addEventListener('DOMContentLoaded', fillAll)
  window.addEventListener('load', fillAll)
  // Tools also set slider values from code (presets, resets).
  setInterval(fillAll, 500)
})()
