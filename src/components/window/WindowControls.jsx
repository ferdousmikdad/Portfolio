import { X, Minus, Maximize2 } from 'lucide-react'

export default function WindowControls({ onClose, onMinimize, onMaximize }) {
  return (
    <div className="flex items-center gap-2 group">
      <button
        onClick={onClose}
        className="traffic-light traffic-light-close"
        title="Close"
      >
        <X size={7} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#4d0000]" strokeWidth={3} />
      </button>
      <button
        onClick={onMinimize}
        className="traffic-light traffic-light-minimize"
        title="Minimize"
      >
        <Minus size={7} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6b4c00]" strokeWidth={3} />
      </button>
      <button
        onClick={onMaximize}
        className="traffic-light traffic-light-maximize"
        title="Maximize"
      >
        <Maximize2 size={6} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0a4d15]" strokeWidth={3} />
      </button>
    </div>
  )
}
