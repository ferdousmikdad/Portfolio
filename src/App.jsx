import { useEffect } from 'react'
import Desktop      from '@/components/desktop/Desktop'
import MobileApp    from '@/components/mobile/MobileApp'
import useSoundStore from '@/store/soundStore'
import useIsMobile  from '@/hooks/useIsMobile'

export default function App() {
  const play     = useSoundStore((s) => s.play)
  const isMobile = useIsMobile()

  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest('button')) play('click')
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [play])

  return isMobile ? <MobileApp /> : <Desktop />
}
