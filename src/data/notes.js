export const CATEGORIES = [
  { id: 'all',         label: 'All' },
  { id: 'blog',        label: 'Blog' },
  { id: 'case-study',  label: 'Case Studies' },
  { id: 'notes',       label: 'Notes' },
  { id: 'drawing',     label: 'Drawing' },
]

export const NOTES = [
  {
    id: 1,
    category: 'blog',
    title: 'Why Simple Designs Win',
    date: 'Apr 10, 2026',
    preview: "Complexity is the enemy of clarity. Here's why stripping back always works.",
    content: "Complexity is the enemy of clarity.\n\nEvery time I open a cluttered interface, I feel the friction. Too many options. Too many colours. Too many things competing for attention. The user doesn't know where to look — so they look nowhere and leave.\n\n**The case for simplicity**\n\nApple built a trillion-dollar company on the idea that the best design is the one you don't notice. When you pick up an iPhone for the first time, you don't read a manual. You just use it. That's the goal.\n\nSimple design isn't about removing features. It's about removing confusion. Every element on the screen should earn its place. If it doesn't guide the user, inform them, or delight them — it shouldn't be there.\n\n**What I've learned**\n\nAfter 5 years of designing digital products, the pattern is consistent: the first draft is always too complicated. The best work comes from subtraction, not addition. Cut the border. Remove the shadow. Trust the whitespace.\n\nThe hardest part of simple design is convincing stakeholders that \"less\" is a valid creative decision. But once users respond — and they always do — the numbers speak for themselves.\n\n**Takeaway**\n\nStart with the user's goal. Remove everything that doesn't serve it. Then remove a bit more.",
  },
  {
    id: 2,
    category: 'blog',
    title: 'Designing with Motion in Mind',
    date: 'Mar 28, 2026',
    preview: "Animation isn't decoration — it's communication. How to use motion purposefully.",
    content: "Animation isn't decoration — it's communication.\n\nBad animation distracts. Good animation guides. The difference is intention.\n\n**Motion as feedback**\n\nWhen a button pulses on press, it confirms the action. When a card slides in from the right, it signals forward navigation. When a window scales down to the dock, the user knows where it went. Each of these is information, not decoration.\n\n**The principles I follow**\n\n1. **Speed** — UI animations should be fast. 200–400ms for most transitions. Anything slower feels sluggish. Anything faster feels invisible.\n2. **Easing** — Use spring physics where possible. Ease-out for entrances. Ease-in for exits. Never linear.\n3. **Purpose** — Every animation should answer a question: What changed? Where did it go? What can I do next?\n\n**Framer Motion changed how I think**\n\nUsing Framer Motion daily has made me much more intentional. The AnimatePresence API forces you to think about both enter and exit states. The spring system makes interactions feel physical. It's the closest I've come to bridging the gap between design tool and production code.\n\n**Takeaway**\n\nBefore adding any animation, ask: what does the user learn from this? If the answer is nothing — skip it.",
  },
  {
    id: 3,
    category: 'case-study',
    title: 'Redesigning a Fintech Dashboard',
    date: 'Mar 15, 2026',
    preview: 'How we reduced cognitive load by 60% with a full information architecture overhaul.',
    content: "**The Problem**\n\nThe client's dashboard had grown organically over 4 years. Features were bolted on without a coherent structure. Users were spending an average of 47 seconds to find their most-used action. Support tickets were through the roof.\n\n**The Process**\n\nWe started with a 2-week discovery phase: user interviews, session recordings, card sorting exercises. Three patterns emerged immediately:\n\n1. Users had 3 core tasks they performed daily — but those tasks were buried 3 levels deep.\n2. The information hierarchy didn't match the user's mental model.\n3. The visual density was overwhelming — everything looked equally important.\n\n**The Solution**\n\nWe rebuilt the information architecture from scratch, surfacing the 3 core tasks in a persistent action bar. Secondary features were moved to a contextual sidebar. The visual language was simplified — one primary colour, two type sizes, generous whitespace.\n\n**The Result**\n\n- Time-to-action reduced from 47s to 8s\n- Support tickets down 62% in the first month\n- NPS score increased from 24 to 61\n\n**What I'd do differently**\n\nWe underestimated the change management side. Users had muscle memory for the old layout. A better onboarding flow for returning users would have eased the transition.",
  },
  {
    id: 4,
    category: 'case-study',
    title: 'Building a Design System from Zero',
    date: 'Feb 20, 2026',
    preview: 'Lessons from creating a token-based design system used across 4 products.',
    content: "**Why we needed it**\n\nFour products. Three designers. Zero shared components. Every team was reinventing buttons, forms, and modals independently. The inconsistency was visible to users and the maintenance cost was killing velocity.\n\n**Where to start**\n\nThe temptation is to start with components. Don't. Start with tokens.\n\nTokens are the DNA of a design system — colour, spacing, typography, radius, shadow. Get these right and components almost design themselves. We spent the first two weeks just on tokens, and it was the best investment we made.\n\n**The token structure**\n\nWe used a three-tier model:\n- **Primitive tokens**: raw values (gray-100, 16px, 0.5rem)\n- **Semantic tokens**: purpose-based (color-background, spacing-md, radius-card)\n- **Component tokens**: scoped overrides (button-bg, input-border)\n\nThis made theming trivial. Dark mode was a 2-hour job because all we had to change was semantic tokens.\n\n**Adoption**\n\nThe system only works if teams use it. We embedded it into the Figma workflow first, then into the codebase. Weekly office hours helped. A shared Slack channel for questions kept the feedback loop tight.\n\n**Takeaway**\n\nA design system is a product, not a project. It needs maintenance, documentation, and champions. Without those three things, it becomes shelfware.",
  },
  {
    id: 5,
    category: 'notes',
    title: 'Quick UX Laws to Remember',
    date: 'Apr 5, 2026',
    preview: "Hick's Law, Fitts's Law, Miller's Law — a cheat sheet.",
    content: "**Hick's Law**\nThe time to make a decision increases with the number and complexity of choices.\n→ Reduce options. Use progressive disclosure.\n\n**Fitts's Law**\nThe time to reach a target is a function of its size and distance.\n→ Make important buttons large and close to where the user already is.\n\n**Miller's Law**\nThe average person can hold 7 (±2) items in working memory.\n→ Chunk information. Don't show 15 nav items. Group and collapse.\n\n**Jakob's Law**\nUsers spend most of their time on other sites. They expect your site to work the same way.\n→ Don't innovate on patterns that already work (form layout, nav position, etc.)\n\n**The Aesthetic-Usability Effect**\nUsers perceive attractive designs as more usable, even when they aren't.\n→ Polish matters. A beautiful interface gets more benefit of the doubt.\n\n**Doherty Threshold**\nProductivity soars when a computer and its users interact at < 400ms.\n→ Optimise for speed. Skeleton screens beat loading spinners.\n\n**Peak-End Rule**\nPeople judge an experience based on its peak and its end, not the average.\n→ Make the best moments great. Nail the finish (confirmation, success state, offboarding).",
  },
  {
    id: 6,
    category: 'notes',
    title: 'Typography Rules I Always Use',
    date: 'Jan 12, 2026',
    preview: 'The non-negotiable type rules that make everything look more professional.',
    content: "**Scale**\nUse a type scale. I like: 11 / 12 / 13 / 15 / 17 / 20 / 24 / 32 / 40 / 52px. Consistent steps, never arbitrary.\n\n**Line height**\nBody text: 1.5–1.65. Headings: 1.1–1.2. Tighter for display, looser for reading.\n\n**Max line length**\n60–75 characters per line for body text. Beyond 80 and the eye struggles to track back to the start of the next line.\n\n**Letter spacing**\nSlightly negative for large headings (−0.02em). Slightly positive for small caps and labels (+0.04em). Never adjust body text tracking.\n\n**Font pairing**\nOne display font + one text font is usually enough. High contrast pairings (serif + sans, or geometric + humanist) work best. Avoid two similar fonts — it reads as a mistake, not a choice.\n\n**Weight**\nUse weight intentionally. Regular + Medium + Semibold covers most hierarchies. Bold should be used sparingly — save it for moments that need real emphasis.\n\n**Colour**\nPrimary text: near-black (not pure black — try #1c1c1e). Secondary text: muted (~60% opacity). Avoid pure grey on coloured backgrounds — it can look washed out.",
  },
]
