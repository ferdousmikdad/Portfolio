import { useMemo } from 'react'
import useWindowStore from '@/store/windowStore'
import projects, { TAGS } from '@/data/projects'
import MacSearchIcon from '@/assets/icons/macsearch.svg?react'

/* The project wall itself, lifted out of the Portfolio window so Finder can
   show the same shelf under its Portfolio favourite — one grid, two places to
   meet it, the way [[ChatPanel]] serves Home. The filter state stays with the
   caller, because each window drives it from its own chrome: the Portfolio
   window from its category sidebar, Finder from its own sidebar and search. */

// ── Filtering ─────────────────────────────────────────────────────────────────

/* Shared so both windows narrow the same list the same way. `type` is
   'recent' | 'category' | 'tag', or null for everything. */
export function filterProjects({ type, item, search }) {
  let list = projects
  if (type === 'recent')        list = [...projects].slice(-4)
  else if (type === 'category') list = projects.filter((p) => p.category === item)
  else if (type === 'tag')      list = projects.filter((p) => p.tags.includes(item))

  if (search?.trim()) {
    const q = search.toLowerCase()
    list = list.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    )
  }
  return list
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick }) {
  const isVideoThumb = project.thumbnailType === 'video'
  return (
    <div
      className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{ border: '1px solid transparent', background: 'var(--wall-bg)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--brand) 25%, transparent)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
      onClick={onClick}
    >
      <div style={{ aspectRatio: '4/3', background: 'var(--wall-bg)', overflow: 'hidden' }}>
        {isVideoThumb ? (
          <video
            src={project.thumbnail}
            autoPlay muted loop playsInline
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <img
            src={project.thumbnail || project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

/* `wide` centres the grid inside a maximized window; `columns` lets a narrower
   host (Finder, whose own sidebar eats 200px) reflow instead of squeezing. */
export default function PortfolioPanel({
  type = null, item = null, search = '', viewMode = 'grid',
  wide = false, columns = 'repeat(3, 1fr)',
}) {
  const openProjectPreview = useWindowStore((s) => s.openProjectPreview)

  const filtered = useMemo(
    () => filterProjects({ type, item, search }),
    [type, item, search],
  )

  return (
    <div className="flex-1 h-full overflow-y-scroll window-scroll">
      <div className={wide ? 'w-full max-w-[1140px] mx-auto p-4' : 'p-4'}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: 'var(--body)' }}>
            <MacSearchIcon width={28} height={28} style={{ opacity: 0.3 }} />
            <p className="text-[12px]">No results</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="flex flex-col gap-1">
            {filtered.map((project) => {
              const tagColors = project.tags.map((tid) => TAGS.find((t) => t.id === tid)?.color).filter(Boolean)
              return (
                <div
                  key={project.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--wall-bg)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = 'transparent' }}
                  onClick={() => openProjectPreview(project)}
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0" style={{ background: 'var(--wall-bg)' }}>
                    <img src={project.thumbnail || project.image} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--headline)' }}>{project.title}</p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--body)' }}>{project.description}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {tagColors.map((color, i) => (
                      <span key={i} className="w-[7px] h-[7px] rounded-full" style={{ background: color }} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: columns }}>
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} onClick={() => openProjectPreview(project)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
