import { useCallback, useRef } from 'react'
import { WORKER_URL, FALLBACK, getResponse, byCategory, RANDOM_CATEGORIES } from '@/data/mikudaAI'

/* Mikuda's answer to one question, whoever is asking — the Messages
   conversation under Home and the Siri field in the menu bar both go through
   here, so the same question gets the same answer in either place.

   `ask(text)` resolves to a reply:
     { type: 'text' | 'image' | 'social' | 'contact',
       text, project?, socialFilter?, contactInfo?, action?, actionLabel? }

   A reply that only the model can give goes to the worker; everything the
   local rules know is answered after a short, human-sized pause. The hook
   keeps its own memory of which portfolio piece it showed last, so "show me
   another" moves through a category rather than repeating itself.         */

const pause = () => new Promise((r) => setTimeout(r, 700 + Math.random() * 400))

export default function useMikuda() {
  const categoryIndex = useRef({})
  const lastCategory  = useRef(null)

  const ask = useCallback(async (text) => {
    const entry = getResponse(text)

    if (entry.isAiFallback) {
      try {
        const res = await fetch(`${WORKER_URL}/mikuda`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        })
        return { type: 'text', text: (await res.json()).reply || FALLBACK }
      } catch {
        return { type: 'text', text: FALLBACK }
      }
    }

    await pause()

    let category = entry.isNext ? lastCategory.current : entry.mediaCategory
    let project = null
    if (category) {
      const pool = byCategory(category)
      if (pool.length > 0) {
        const random = RANDOM_CATEGORIES.has(category)
        const idx = random
          ? Math.floor(Math.random() * pool.length)
          : (categoryIndex.current[category] ?? 0) % pool.length
        project = pool[idx]
        if (!random) categoryIndex.current[category] = idx + 1
        lastCategory.current = category
      }
    }

    if (project)            return { type: 'image',   text: entry.answer || "Here's another one:", project }
    if (entry.socialLinks)  return { type: 'social',  text: entry.answer, socialFilter: entry.socialFilter ?? null }
    if (entry.contactInfo)  return { type: 'contact', text: entry.answer || '', contactInfo: entry.contactInfo }
    return { type: 'text', text: entry.answer || FALLBACK, action: entry.action, actionLabel: entry.actionLabel }
  }, [])

  const forget = useCallback(() => {
    categoryIndex.current = {}
    lastCategory.current = null
  }, [])

  return { ask, forget }
}
