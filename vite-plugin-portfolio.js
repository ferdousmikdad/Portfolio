/**
 * vite-plugin-portfolio
 *
 * Scans public/portfolio/ and auto-builds the projects list.
 *
 * Supported folder layouts
 * ─────────────────────────
 * Flat (category folder = category id):
 *   public/portfolio/landing-pages/my-project/
 *
 * Section-based (natural grouping — recommended):
 *   public/portfolio/ui-ux-design/landing-page-3/
 *   public/portfolio/branding-logo/my-logo/
 *
 * Both layouts can coexist.
 *
 * Category is inferred from the folder name using these prefix rules:
 *   landing-page / landing  → landing-pages
 *   dashboard               → dashboards
 *   mobile                  → mobile-ui
 *   arabic-logo / arabic    → arabic-logo
 *   brand-identity / brand  → brand-identity
 *   (anything else)         → logo  (inside branding-logo/)
 *                           → landing-pages  (inside ui-ux-design/)
 *
 * Override with _meta.json in the project folder:
 *   { "title": "…", "description": "…", "category": "…", "tags": ["blue"] }
 */

import { readdirSync, existsSync, statSync, readFileSync } from 'fs'
import { join, extname } from 'path'

const VIRTUAL_ID  = 'virtual:portfolio-projects'
const RESOLVED_ID = '\0virtual:portfolio-projects'
const IMAGE_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.avif'])

// Flat category folders (folder name = category id)
const FLAT_CATEGORIES = new Set([
  'logo', 'arabic-logo', 'brand-identity',
  'landing-pages', 'dashboards', 'mobile-ui',
])

// Section folders that group projects (old / natural layout)
const SECTION_MAP = {
  'ui-ux-design':  'landing-pages',  // default category for this section
  'branding-logo': 'logo',           // default category for this section
}

// Infer category from project slug
function inferCategory(slug, sectionDefault) {
  const s = slug.toLowerCase()
  if (s.startsWith('landing-page') || s.startsWith('landing')) return 'landing-pages'
  if (s.startsWith('dashboard'))                                  return 'dashboards'
  if (s.startsWith('mobile'))                                     return 'mobile-ui'
  if (s.startsWith('arabic-logo') || s.startsWith('arabic'))     return 'arabic-logo'
  if (s.startsWith('brand-identity') || s.startsWith('brand'))   return 'brand-identity'
  return sectionDefault
}

function slugToTitle(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function readMeta(projectPath) {
  const metaFile = join(projectPath, '_meta.json')
  if (!existsSync(metaFile)) return {}
  try { return JSON.parse(readFileSync(metaFile, 'utf-8')) } catch { return {} }
}

function collectProjects(projectPath, categoryId, slug, id) {
  const files = readdirSync(projectPath).filter(
    (f) => IMAGE_EXTS.has(extname(f).toLowerCase())
  )
  if (files.length === 0) return null

  const thumbFile   = files.find((f) => f.includes('-thumbnail')) || files[0]
  const previewFile = files.find((f) => !f.includes('-thumbnail')) || thumbFile
  const base        = `/portfolio`

  // Reconstruct the public URL path from the actual disk path
  // We need the path relative to public/
  const meta = readMeta(projectPath)

  return {
    id,
    title:       meta.title       ?? slugToTitle(slug),
    description: meta.description ?? '',
    thumbnail:   meta.thumbnail   ?? `${base}/${categoryId}/${slug}/${thumbFile}`,
    preview:     meta.preview     ?? `${base}/${categoryId}/${slug}/${previewFile}`,
    category:    meta.category    ?? categoryId,
    tags:        meta.tags        ?? [],
  }
}

function scanPortfolio(portfolioDir) {
  if (!existsSync(portfolioDir)) return []

  const projects = []
  let id = 1

  const topDirs = readdirSync(portfolioDir).filter(
    (name) => statSync(join(portfolioDir, name)).isDirectory()
  )

  for (const topName of topDirs) {
    const topPath = join(portfolioDir, topName)

    if (FLAT_CATEGORIES.has(topName)) {
      // ── Flat layout: public/portfolio/<category-id>/<slug>/ ──────────────
      for (const slug of readdirSync(topPath)) {
        const projectPath = join(topPath, slug)
        if (!statSync(projectPath).isDirectory()) continue
        const entry = collectProjects(projectPath, topName, slug, id)
        if (entry) { projects.push(entry); id++ }
      }

    } else if (SECTION_MAP[topName] !== undefined) {
      // ── Section layout: public/portfolio/ui-ux-design/<slug>/ ───────────
      const sectionDefault = SECTION_MAP[topName]
      for (const slug of readdirSync(topPath)) {
        const projectPath = join(topPath, slug)
        if (!statSync(projectPath).isDirectory()) continue

        const meta     = readMeta(projectPath)
        const category = meta.category ?? inferCategory(slug, sectionDefault)

        // Build the URL using the section folder path
        const files = readdirSync(projectPath).filter(
          (f) => IMAGE_EXTS.has(extname(f).toLowerCase())
        )
        if (files.length === 0) continue

        const thumbFile   = files.find((f) => f.includes('-thumbnail')) || files[0]
        const previewFile = files.find((f) => !f.includes('-thumbnail')) || thumbFile
        const base        = `/portfolio/${topName}/${slug}`

        projects.push({
          id:          id++,
          title:       meta.title       ?? slugToTitle(slug),
          description: meta.description ?? '',
          thumbnail:   `${base}/${thumbFile}`,
          preview:     `${base}/${previewFile}`,
          category,
          tags:        meta.tags ?? [],
        })
      }
    }
    // Unrecognised top-level folders are silently skipped
  }

  return projects
}

export default function portfolioPlugin() {
  let portfolioDir = ''

  return {
    name: 'vite-plugin-portfolio',

    configResolved(config) {
      portfolioDir = join(config.root, 'public', 'portfolio')
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    load(id) {
      if (id !== RESOLVED_ID) return
      const projects = scanPortfolio(portfolioDir)
      return `export default ${JSON.stringify(projects, null, 2)}`
    },

    configureServer(server) {
      // Watch the entire portfolio tree — polling picks up new files & folders
      server.watcher.add(portfolioDir)

      // Re-scan and full-reload whenever anything inside portfolio/ changes
      server.watcher.on('all', (event, file) => {
        if (!file.startsWith(portfolioDir)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
