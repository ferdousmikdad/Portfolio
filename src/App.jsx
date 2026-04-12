import { useEffect } from 'react'
import Desktop from '@/components/desktop/Desktop'
import useSoundStore from '@/store/soundStore'

export default function App() {
  const play = useSoundStore((s) => s.play)

  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest('button')) play('click')
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [play])

  return <Desktop />
}
