import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ── Notes the visitor writes ──────────────────────────────────────────────
   The site's own notes (data/notes) are Mikdad's posts and stay read-only.
   The compose button adds notes here instead, kept in the visitor's own
   browser: { id, content, updatedAt }. A note's title is its first line,
   the way Notes takes it.                                                 */

const useNotesStore = create(
  persist(
    (set) => ({
      mine: [],
      add: () => {
        const id = `u-${Date.now().toString(36)}`
        set((s) => ({ mine: [{ id, content: '', updatedAt: Date.now() }, ...s.mine] }))
        return id
      },
      update: (id, content) => set((s) => ({
        mine: s.mine.map((n) => (n.id === id ? { ...n, content, updatedAt: Date.now() } : n)),
      })),
      remove: (id) => set((s) => ({ mine: s.mine.filter((n) => n.id !== id) })),
    }),
    { name: 'portfolio-notes' },
  ),
)

/* A stored note in the shape the list and reader use. */
export function asNote(n) {
  // Notes are stored as HTML; the list works from their plain text.
  const text = n.content
    .replace(/<\/?(p|div|h1|h2|li|tr|ul|ol|table)\b[^>]*>|<br\s*\/?>/gi, '\n')
    .replace(/<\/td>/gi, '  ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  return {
    id: n.id,
    mine: true,
    category: 'notes',
    title: lines[0] || 'New Note',
    preview: lines.slice(1).join(' ') || 'No additional text',
    content: n.content,
    text: lines.join('\n'),
    date: new Date(n.updatedAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }),
    updatedAt: n.updatedAt,
  }
}

export default useNotesStore
