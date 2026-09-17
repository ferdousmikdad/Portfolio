/* ── Liquid Glass ──────────────────────────────────────────────────────────
   The material, split out so the dock, the search panel and anything else can
   share one implementation. Four stacked layers:

     filter    captures the backdrop and bends it through feTurbulence
     overlay   flat tint that gives the glass its body
     specular  the hard highlight along the top edge
     content   whatever sits on top

   `backdrop-filter` captures what is behind the element; a plain `filter` then
   distorts that captured layer. Distorting the backdrop is what reads as
   glass — a blur on its own reads as frosted plastic.                        */

/** Mount once, near the root: the filters every glass surface references. */
export function GlassDefs() {
  return (
    <svg aria-hidden="true" style={{ display: 'none' }}>
      {/* Large surfaces — the dock */}
      <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.008"
          numOctaves="2"
          seed="92"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurred"
          scale="70"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* Small surfaces — tooltips, panels. The dock's scale would scramble
          anything this size, so the noise is finer and the throw shorter. */}
      <filter id="lg-dist-sm" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.02 0.02"
          numOctaves="2"
          seed="41"
          result="noiseSm"
        />
        <feGaussianBlur in="noiseSm" stdDeviation="1.4" result="blurredSm" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurredSm"
          scale="10"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  )
}

/**
 * The glass layers themselves. Absolutely fills its positioned parent and
 * clips to the parent's radius, so magnified or overflowing content can still
 * escape the parent while the glass stays inside the shape.
 */
export default function GlassLayers({ small = false, specular = true, children }) {
  return (
    <div className="lg-glass">
      <div
        className="lg-glass__filter"
        style={{ filter: `url(#${small ? 'lg-dist-sm' : 'lg-dist'})` }}
      />
      <div className="lg-glass__overlay" />
      {/* An inset box-shadow follows the border box, not a clip-path, so a
          surface clipped to a custom silhouette draws its own edge instead. */}
      {specular && <div className="lg-glass__specular" />}
      {children}
    </div>
  )
}
