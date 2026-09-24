import SFSymbol from '@/components/ui/SFSymbol'
import { TAGS } from '@/data/projects'

/* ── Finder's four views over one list of items ─────────────────────────────
   Every file location — Applications, Desktop, Recents, a tag, the Trash —
   hands this the same shape of item, and the toolbar's view switcher picks
   how it is drawn, as in Finder:

     icons    the grid: 64pt icon, name under it, the name filled with the
              accent when selected
     list     Name / Date Modified / Size / Kind columns, alternating row
              stripes, a 16pt icon, the whole row filled when selected
     columns  the items in one column and, beside it, the preview column:
              the selected item large, its name, kind and size, and its
              dates under "Information"
     gallery  the selected item large on the stage, a strip of thumbnails
              underneath

   `group` ('none' | 'kind' | 'name' | 'tags') splits icons and list into
   headed sections, which is what the Group button does.

   Item: { id, label, icon, thumb, kind, size, date, tags, disabled, onOpen }
   `renderIcon(item, props)` lets a caller draw an icon-view tile itself —
   the Applications grid uses it to keep apps draggable to the Trash.     */

export const KIND_LABEL = {
  application: 'Application',
  document:    'Plain Text Document',
  folder:      'Folder',
  image:       'JPEG image',
  pdf:         'PDF document',
}
const KIND_GROUP = {
  application: 'Applications',
  folder:      'Folders',
  document:    'Documents',
  image:       'Images',
  pdf:         'PDF Documents',
}

const fmtDate = (d) => d
  ? new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  : '--'

export function groupItems(items, group) {
  const sorted = [...items].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
  if (group === 'none') return [{ title: null, items: sorted }]
  const buckets = new Map()
  const put = (title, it) => { if (!buckets.has(title)) buckets.set(title, []); buckets.get(title).push(it) }
  for (const it of sorted) {
    if (group === 'kind') put(KIND_GROUP[it.kind] ?? 'Other', it)
    else if (group === 'name') put(/[a-z]/i.test(it.label[0]) ? it.label[0].toUpperCase() : '#', it)
    else if (group === 'tags') {
      const t = TAGS.find((x) => x.id === it.tags?.[0])
      put(t ? t.label : 'No Tags', it)
    }
  }
  return [...buckets.entries()].map(([title, list]) => ({ title, items: list }))
}

function TagDots({ tags }) {
  if (!tags?.length) return null
  return (
    <span className="fb-tags">
      {tags.map((t) => <i key={t} style={{ background: TAGS.find((x) => x.id === t)?.color }} />)}
    </span>
  )
}

export function IconTile({ item, selected, onSelect, onOpen, onContextMenu, dragHandlers }) {
  return (
    <button
      className="fb-tile"
      data-selected={selected || undefined}
      data-disabled={item.disabled || undefined}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
      {...dragHandlers}
    >
      <span className="fb-tile__art">
        <img src={item.icon} alt="" draggable={false} data-thumb={item.thumb || undefined} />
      </span>
      <span className="fb-tile__label"><TagDots tags={item.tags} />{item.label}</span>
    </button>
  )
}

export default function FinderBrowser({
  items, view, group = 'none', selectedId, onSelect, onContextMenu, renderIcon, empty,
}) {
  const selected = items.find((i) => i.id === selectedId)
  const open = (it) => !it.disabled && it.onOpen?.()
  const menu = (it) => (e) => { e.preventDefault(); e.stopPropagation(); onSelect(it.id); onContextMenu?.(e, it) }

  if (!items.length) return empty ?? null

  if (view === 'list') {
    return (
      <div className="fb-list" onClick={() => onSelect(null)}>
        <div className="fb-list__head">
          <span>Name</span><span>Date Modified</span><span>Size</span><span>Kind</span>
        </div>
        {groupItems(items, group).map((g) => (
          <div key={g.title ?? 'all'}>
            {g.title && <p className="fb-group">{g.title}</p>}
            {g.items.map((it) => (
              <button
                key={it.id}
                className="fb-row"
                data-selected={it.id === selectedId || undefined}
                data-disabled={it.disabled || undefined}
                onClick={(e) => { e.stopPropagation(); onSelect(it.id) }}
                onDoubleClick={() => open(it)}
                onContextMenu={menu(it)}
              >
                <span className="fb-row__name">
                  <img src={it.icon} alt="" draggable={false} />
                  <span>{it.label}</span>
                  <TagDots tags={it.tags} />
                </span>
                <span>{fmtDate(it.date)}</span>
                <span>{it.size ?? '--'}</span>
                <span>{KIND_LABEL[it.kind] ?? it.kind}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (view === 'columns') {
    const sorted = groupItems(items, 'none')[0].items
    return (
      <div className="fb-columns" onClick={() => onSelect(null)}>
        <div className="fb-col">
          {sorted.map((it) => (
            <button
              key={it.id}
              className="fb-colrow"
              data-selected={it.id === selectedId || undefined}
              data-disabled={it.disabled || undefined}
              onClick={(e) => { e.stopPropagation(); onSelect(it.id) }}
              onDoubleClick={() => open(it)}
              onContextMenu={menu(it)}
            >
              <img src={it.icon} alt="" draggable={false} />
              <span>{it.label}</span>
              {it.kind === 'folder' && <SFSymbol name="chevron.right" size={9} />}
            </button>
          ))}
        </div>
        <div className="fb-preview">
          {selected ? (
            <>
              <img src={selected.icon} alt="" draggable={false} data-thumb={selected.thumb || undefined} />
              <p className="fb-preview__name">{selected.label}</p>
              <p className="fb-preview__kind">
                {KIND_LABEL[selected.kind] ?? selected.kind}{selected.size && selected.size !== '—' ? ` – ${selected.size}` : ''}
              </p>
              <p className="fb-preview__section">Information</p>
              <dl className="fb-preview__grid">
                <dt>Created</dt><dd>{fmtDate(selected.date)}</dd>
                <dt>Modified</dt><dd>{fmtDate(selected.date)}</dd>
                <dt>Last opened</dt><dd>{fmtDate(selected.date)}</dd>
              </dl>
            </>
          ) : null}
        </div>
      </div>
    )
  }

  if (view === 'gallery') {
    const sorted = groupItems(items, 'none')[0].items
    const shown = selected ?? sorted[0]
    return (
      <div className="fb-gallery">
        <div className="fb-gallery__stage" onDoubleClick={() => open(shown)}>
          <img src={shown.icon} alt="" draggable={false} data-thumb={shown.thumb || undefined} />
          <p className="fb-preview__name">{shown.label}</p>
          <p className="fb-preview__kind">{KIND_LABEL[shown.kind] ?? shown.kind}</p>
        </div>
        <div className="fb-gallery__strip">
          {sorted.map((it) => (
            <button
              key={it.id}
              className="fb-gallery__thumb"
              data-selected={it.id === shown.id || undefined}
              onClick={() => onSelect(it.id)}
              onDoubleClick={() => open(it)}
              onContextMenu={menu(it)}
              title={it.label}
            >
              <img src={it.icon} alt="" draggable={false} data-thumb={it.thumb || undefined} />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Icons
  return (
    <div onClick={() => onSelect(null)} style={{ minHeight: '100%' }}>
      {groupItems(items, group).map((g) => (
        <div key={g.title ?? 'all'}>
          {g.title && <p className="fb-group">{g.title}</p>}
          <div className="fb-grid">
            {g.items.map((it) => {
              const props = {
                item: it,
                selected: it.id === selectedId,
                onSelect: () => onSelect(it.id),
                onOpen: () => open(it),
                onContextMenu: menu(it),
              }
              return renderIcon ? <div key={it.id}>{renderIcon(it, props)}</div> : <IconTile key={it.id} {...props} />
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
