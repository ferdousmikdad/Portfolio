import Window from '@/components/window/Window'

/* Plain-text files, opened the way TextEdit opens a .txt: the name centred
   in the title bar, the text in TextEdit's plain-text font (Menlo) on the
   page colour, nothing drawn that a .txt file could not contain — so
   headings are set apart by a blank line, not by a typed rule. */

export const DOCS = {
  bio: {
    title: 'about_me.txt',
    content: `Ferdous Mikdad
Creative & UI/UX Designer

5+ years shaping brands, web,
and product experiences.

Good design should feel inevitable.`,
  },

  skills: {
    title: 'skills.txt',
    content: `Skills

UI/UX Design
Branding & Identity
Web & Product Design
Motion

Figma · Illustrator · Framer`,
  },

  contact: {
    title: 'contact.txt',
    content: `Contact

ferdousmikdad@gmail.com

linkedin.com/in/ferdousmikdad
instagram.com/ferdousmikdad`,
  },
}

export default function DocWindow({ id }) {
  const doc = DOCS[id]
  if (!doc) return null

  return (
    <Window id={id} title={doc.title} centerTitle>
      <div className="doc-plain-wrap">
        <pre className="doc-plain-text">{doc.content}</pre>
      </div>
    </Window>
  )
}
