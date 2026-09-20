/* ── System profile ────────────────────────────────────────────────────────
   One set of facts, two jokes.

   About This Mac dresses these as a Mac spec sheet; `neofetch` dresses the
   same values as terminal output. They used to be written out separately and
   had already drifted — the Stack line said "React · Figma · Motion" while
   the spec sheet listed Figma/Illustrator/After Effects and React/Tailwind/
   Framer. Whichever one you updated, the other quietly went stale.

   Everything here except CHIP, OS and SHELL is a real fact taken from the
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
  os: 'Portfolio OS v2.0',
  shell: 'portfolio-zsh 1.0',
}

export default SYSTEM_PROFILE
