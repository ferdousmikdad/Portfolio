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
 * Content auto-discovery
 * ──────────────────────
 * Inside each project folder:
 *   {slug}-thumbnail.{ext}   → thumbnail shown in the grid card
 *   {slug}-1.{ext}           → first content item
 *   {slug}-2.{ext}           → second content item (image or video)
 *   …
 * If no numbered files exist, any non-thumbnail file is used as the single
 * content item (backwards-compatible with simple single-image projects).
 *
 * Override with _meta.json in the project folder:
 *   { "title": "…", "description": "…", "category": "…", "tags": ["blue"] }
 */

import { readdirSync, existsSync, statSync, readFileSync } from 'fs'
import { join, extname } from 'path'

const VIRTUAL_ID  = 'virtual:portfolio-projects'
const RESOLVED_ID = '\0virtual:portfolio-projects'

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.avif'])
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov'])

function mediaType(filename) {
  const ext = extname(filename).toLowerCase()
  if (VIDEO_EXTS.has(ext)) return 'video'
  if (IMAGE_EXTS.has(ext)) return 'image'
  return null
}

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

// Detect thumbnail files — handles "-thumbnail", "- thumbnail", "_thumbnail"
const isThumb = (f) => /[\s_-]+thumbnail/i.test(f)

/**
 * Build a single project entry.
 * @param {string} projectPath  — absolute disk path to the project folder
 * @param {string} urlBase      — public URL prefix, e.g. /portfolio/branding-logo/brand-identity-1
 * @param {string} slug         — folder name, e.g. brand-identity-1
 * @param {number} id
 * @param {string} categoryDefault — inferred category if _meta.json doesn't override
 */
function buildProject(projectPath, urlBase, slug, id, categoryDefault) {
  const allFiles   = readdirSync(projectPath)
  const mediaFiles = allFiles.filter((f) => mediaType(f) !== null)
  if (mediaFiles.length === 0) return null

  const meta = readMeta(projectPath)

  // ── Thumbnail ──────────────────────────────────────────────────────────────
  const thumbFile     = mediaFiles.find(isThumb) ?? mediaFiles[0]
  const thumbType     = mediaType(thumbFile)

  // ── Content files (everything except the thumbnail) ────────────────────────
  const nonThumbFiles = mediaFiles.filter((f) => f !== thumbFile)

  // Look for numbered files: {slug}-{N}.ext  (N is an integer)
  // Escape the slug for use in regex (handles hyphens and numbers in slug itself)
  const slugEsc       = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const numberedRe    = new RegExp(`^${slugEsc}[\\s_-]+(\\d+)\\.[a-z0-9]+$`, 'i')

  const numberedFiles = nonThumbFiles
    .filter((f) => numberedRe.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(numberedRe)[1], 10)
      const nb = parseInt(b.match(numberedRe)[1], 10)
      return na - nb
    })

  // Build content array
  let content
  if (numberedFiles.length > 0) {
    // Use sorted numbered files as content
    content = numberedFiles.map((f) => ({ url: `${urlBase}/${f}`, type: mediaType(f) }))
  } else if (nonThumbFiles.length > 0) {
    // Fall back to any non-thumbnail file (single-image projects like arabic-logo)
    content = nonThumbFiles.map((f) => ({ url: `${urlBase}/${f}`, type: mediaType(f) }))
  } else {
    // Only a thumbnail exists — use it as content too
    content = [{ url: `${urlBase}/${thumbFile}`, type: thumbType }]
  }

  // Preview = first image in content (for backwards-compat / list view fallback)
  const previewItem = content.find((c) => c.type === 'image') ?? content[0]

  return {
    id,
    title:         meta.title         ?? slugToTitle(slug),
    description:   meta.description   ?? '',
    thumbnail:     meta.thumbnail     ?? `${urlBase}/${thumbFile}`,
    thumbnailType: thumbType,
    preview:       meta.preview       ?? previewItem.url,
    content,
    category:      meta.category      ?? categoryDefault,
    tags:          meta.tags          ?? [],
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
        const urlBase = `/portfolio/${topName}/${slug}`
        const entry   = buildProject(projectPath, urlBase, slug, id, topName)
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
        const urlBase  = `/portfolio/${topName}/${slug}`

        const entry = buildProject(projectPath, urlBase, slug, id, category)
        if (entry) { projects.push(entry); id++ }
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
