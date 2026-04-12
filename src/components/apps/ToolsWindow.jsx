import { useState } from 'react'
import Window from '@/components/window/Window'
import TOOLS from '@/data/tools'

export default function ToolsWindow({ activeTool }) {
  const tool = TOOLS.find((t) => t.id === activeTool) ?? TOOLS[0]

  return (
    <Window id="tools" title={tool.name}>
      <div className="w-full h-full relative overflow-hidden rounded-b-[20px]">
        {tool.url ? (
          <iframe
            key={tool.id}
            src={tool.url}
            title={tool.name}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
              borderRadius: '0 0 20px 20px',
            }}
            allow="clipboard-write"
          />
        ) : (
          /* Coming soon placeholder */
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <img
              src={tool.icon}
              alt={tool.name}
              className="w-14 h-14 opacity-30"
              style={{ filter: 'grayscale(1)' }}
            />
            <p
              className="text-[13px] font-medium"
              style={{ color: 'var(--headline)', fontFamily: "'SF Pro Display'" }}
            >
              {tool.name}
            </p>
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--body)', opacity: 0.4, letterSpacing: '0.14em' }}
            >
              Coming Soon
            </span>
          </div>
        )}
      </div>
    </Window>
  )
}
