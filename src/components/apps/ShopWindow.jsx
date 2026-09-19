import Window from '@/components/window/Window'
import ShopPanel from '@/components/apps/ShopPanel'

export default function ShopWindow() {
  return (
    <Window id="shop" title="Shop">
      {/* The same shelf Finder shows under its Shop favourite */}
      <ShopPanel />
    </Window>
  )
}
