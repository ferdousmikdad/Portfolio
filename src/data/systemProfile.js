/* ── System profile ────────────────────────────────────────────────────────
   One set of facts, two jokes.

   About This Mac dresses these as a Mac spec sheet; `neofetch` dresses the
   same values as terminal output. They used to be written out separately and
   had already drifted — the Stack line said "React · Figma · Motion" while
   the spec sheet listed Figma/Illustrator/After Effects and React/Tailwind/
   Framer. Whichever one you updated, the other quietly went stale.

   Everything here except CHIP, the OS name and SHELL is a real fact taken from the
   portfolio's own copy (`BioWindow`, `AboutMeWindow`). Those three are
   obvious gags and read as such. Change a value here and both surfaces
   follow.                                                                 */

const SYSTEM_PROFILE = {
  name: 'Ferdous Mikdad',
  user: 'ferdous',
  host: 'portfolio',

  /* Short title, as the spec sheet's subtitle uses it. */
  role: 'Creative & UI/UX Designer',
  /* Longer form, as neofetch's Role line uses it. */
  roleLong: 'UI/UX Designer & Developer',

  experience: '5+ years experience',
  design: 'Figma · Illustrator · After Effects',
  engineering: 'React · Tailwind · Framer',
  origin: 'Print & Branding',
  status: 'Available for hire',
  serial: 'AVAILABLE-FOR-HIRE',

  // The gags.
  chip: 'Mikdad M5 Pro',
  shell: 'portfolio-zsh 1.0',

  /* The OS, split into parts because Software Update has to be able to talk
     about a version that is not the one running. `os` is composed rather
     than written out so the Terminal, About This Mac and the update pane
     cannot drift the way the spec lines once did. */
  osName: 'macOS Mikdad',
  osVersion: '26.0.1',
}

/** "macOS Mikdad 26.1" — the string every surface prints. */
export const osString = (version = SYSTEM_PROFILE.osVersion) =>
  `${SYSTEM_PROFILE.osName} ${version}`

SYSTEM_PROFILE.os = osString()

export default SYSTEM_PROFILE
