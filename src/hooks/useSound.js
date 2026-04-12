import useSoundStore from '@/store/soundStore'

/**
 * Thin hook around the sound store's play function.
 *
 * Usage:
 *   const play = useSound()
 *   play('click')      // plays click.wav
 *   play('open')       // plays open.wav
 *   play('close')      // plays close.wav
 *   play('minimize')   // plays minimize.wav
 *   play('notification') // plays notification.wav
 */
export default function useSound() {
  return useSoundStore((s) => s.play)
}
