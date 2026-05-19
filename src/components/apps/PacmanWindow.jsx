import Window from '@/components/window/Window'
import PacmanGame from './PacmanGame'

export default function PacmanWindow() {
  return (
    <Window id="pacman" title="Pac-Man">
      <PacmanGame />
    </Window>
  )
}
