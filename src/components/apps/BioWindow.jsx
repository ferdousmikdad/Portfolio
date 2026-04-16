import Window from '@/components/window/Window'

export const DOCS = {
  bio: {
    title: 'about_me.txt',
    content: `Ferdous Mikdad
Creative & UI/UX Designer
————————————————————

5+ years shaping brands, web,
and product experiences.

Good design should feel inevitable.`,
  },

  skills: {
    title: 'skills.txt',
    content: `Skills
————————————————————

UI/UX Design
Branding & Identity
Web & Product Design
Motion

Figma · Illustrator · Framer`,
  },

  contact: {
    title: 'contact.txt',
    content: `Contact
————————————————————

ferdousmikdad@gmail.com

linkedin.com/in/ferdousmikdad
instagram.com/ferdousmikdad`,
  },
}

export default function DocWindow({ id }) {
  const doc = DOCS[id]
  if (!doc) return null

  return (
    <Window id={id} title={doc.title}>
      <div className="doc-plain-wrap">
        <pre className="doc-plain-text">{doc.content}</pre>
      </div>
    </Window>
  )
}
