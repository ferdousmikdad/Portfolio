import { useState, useRef, useEffect, useCallback } from 'react'
import Window from '@/components/window/Window'
import useWindowStore from '@/store/windowStore'
import useSound from '@/hooks/useSound'
import TOOLS from '@/data/tools'

/* ── Palette ──────────────────────────────────────────────────────── */
const FONT = "'SF Pro Text'"
const G  = '#4af08e'
const C  = '#56b6c2'
const R  = '#ff6b6b'
const W  = '#e2e2e2'
const D  = '#666'
const BG = 'var(--bg)'

const PROMPT = 'ferdous@portfolio:~$ '

const URL_RE = /^https?:\/\/|^www\.|^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.(?:com|net|org|io|dev|co|me|app|ai|tv|gg|info|edu|gov|design|studio|agency|media|digital|creative|shop|store|online|site|web|tech|photography|art|gallery|blog|news|press|space|cloud|link|page|run|works|fund|world|global|systems|solutions|services|consulting|ventures|partners|group|team|tools|lab|labs|codes|build|built|made|land|zone|plus|pro|expert|guru|ninja|rocks|club|community|network|social|live|stream|show|play|game|games|music|video|films|photos|events|travel|tours|hotel|cafe|bar|shop|market|store|sale|deals|trade|exchange|finance|capital|fund|invest|bank|pay|money|cash|coin|gold|diamond|luxury|fashion|style|wear|clothing|shoes|bags|beauty|health|fit|care|life|living|home|house|estate|realty|build|construction|repair|clean|green|eco|solar|energy|farm|food|eat|kitchen|chef|pizza|coffee|tea|beer|wine|spirits|spa|yoga|gym|sport|run|bike|surf|ski|golf|tennis|football|soccer|basketball|cricket|games|casino|poker|bet|win|play|fun|kids|baby|family|wedding|party|gift|love|flowers|art|music|band|dj|dance|theatre|cinema|film|tv|radio|podcast|news|media|press|blog|magazine|journal|book|books|story|stories|write|read|learn|teach|school|college|university|academy|institute|center|centre|foundation|charity|ngo|org|church|temple|mosque|gov|mil|edu|int)\b/i
const toUrl  = (s) => /^https?:\/\//i.test(s) ? s : `https://${s}`
const MATRIX = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01101001001010'

/* ── Line factory ─────────────────────────────────────────────────── */
let _lid = 0
const ln = (type, content) => ({ id: _lid++, type, content })

/* ── Boot sequence ────────────────────────────────────────────────── */
const BOOT = [
  { text: 'Initializing portfolio OS...',     delay: 0    },
  { text: 'Loading Ferdous.exe...',           delay: 500  },
  { text: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%',      delay: 1050 },
  { text: 'All systems operational. ✓',       delay: 1350 },
  { text: '',                                 delay: 1550 },
  { text: "Type 'help' to get started.",      delay: 1650 },
  { text: '',                                 delay: 1750 },
]

/* ── Neofetch data ────────────────────────────────────────────────── */
const ASCII_ART = [
  '  ████████╗███╗   ███╗',
  '  ██╔════╝████╗ ████║ ',
  '  █████╗  ██╔████╔██║ ',
  '  ██╔══╝  ██║╚██╔╝██║ ',
  '  ██║     ██║ ╚═╝ ██║ ',
  '  ╚═╝     ╚═╝     ╚═╝ ',
  '                       ',
  '                       ',
]
const NFO_INFO = [
  { t: 'user' },
  { t: 'sep'  },
  { t: 'kv', k: 'OS',     v: 'Portfolio OS v2.0'           },
  { t: 'kv', k: 'Role',   v: 'UI/UX Designer & Developer'  },
  { t: 'kv', k: 'Stack',  v: 'React · Figma · Motion'      },
  { t: 'kv', k: 'Shell',  v: 'portfolio-zsh 1.0'           },
  { t: 'kv', k: 'Theme',  v: 'Dark Mode (obviously)'       },
  { t: 'kv', k: 'Status', v: 'Available for hire ✅'        },
]

/* ── JSX helpers ──────────────────────────────────────────────────── */
const HelpRow = ({ cmd, desc }) => (
  <span style={{ display: 'block', padding: '0 16px', lineHeight: '1.6', fontFamily: FONT, fontSize: 12.5 }}>
    <span style={{ color: C, display: 'inline-block', minWidth: 190 }}>{cmd}</span>
    <span style={{ color: D }}>{desc}</span>
  </span>
)
const KVRow = ({ k, v }) => (
  <span style={{ display: 'block', padding: '0 16px', lineHeight: '1.6', fontFamily: FONT, fontSize: 12.5 }}>
    <span style={{ color: C, display: 'inline-block', minWidth: 110 }}>{k}</span>
    <span style={{ color: D }}>→  </span>
    <span style={{ color: W }}>{v}</span>
  </span>
)
const NfoInfo = ({ row }) => {
  if (row.t === 'user') return <span><span style={{ color: G }}>ferdous</span><span style={{ color: W }}>@</span><span style={{ color: G }}>portfolio</span></span>
  if (row.t === 'sep')  return <span style={{ color: D }}>─────────────────────────────</span>
  return <span><span style={{ color: C }}>{row.k}</span><span style={{ color: D }}>: </span><span style={{ color: W }}>{row.v}</span></span>
}

/* ── Line renderer ────────────────────────────────────────────────── */
function Line({ line }) {
  const base = { fontFamily: FONT, fontSize: 12.5, lineHeight: '1.6', whiteSpace: 'pre-wrap', padding: '0 16px', minHeight: 20 }
  if (line.type === 'input') return (
    <div style={base}>
      <span style={{ color: G, userSelect: 'none', whiteSpace: 'pre' }}>{PROMPT}</span>
      <span style={{ color: W }}>{line.content}</span>
    </div>
  )
  if (line.type === 'jsx') return <div style={{ ...base, color: W }}>{line.content}</div>
  const colorMap = { system: D, output: W, error: R, success: G, info: C }
  return <div style={{ ...base, color: colorMap[line.type] ?? W }}>{line.content}</div>
}

/* ── Main component ───────────────────────────────────────────────── */
export default function TerminalWindow() {
  const { closeWindow, openWindow, openTool } = useWindowStore()
  const win    = useWindowStore(s => s.windows.find(w => w.id === 'terminal'))
  const play   = useSound()

  const [lines,       setLines]       = useState([])
  const [input,       setInput]       = useState('')
  const [history,     setHistory]     = useState([])
  const [histIdx,     setHistIdx]     = useState(-1)
  const [booted,      setBooted]      = useState(false)
  const [hackRows,      setHackRows]      = useState(null)
  const [urlLoading,    setUrlLoading]    = useState(false)
  const [aiThinking,    setAiThinking]    = useState(false)
  const [dots,          setDots]          = useState(1)
  const [aiActive,      setAiActive]      = useState(false)
  const [installProgress, setInstallProgress] = useState(null)

  const inputRef     = useRef(null)
  const scrollRef    = useRef(null)
  const hackTimer    = useRef(null)
  const installTimer = useRef(null)
  const aiActiveRef  = useRef(false)   // ref so execute closure always reads latest value

  const activateAi   = () => { aiActiveRef.current = true;  setAiActive(true)  }
  const deactivateAi = () => { aiActiveRef.current = false; setAiActive(false) }

  /* auto-scroll */
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, hackRows, urlLoading, input, installProgress])

  /* blinking dots while URL loading or AI thinking */
  useEffect(() => {
    if (!urlLoading && !aiThinking) { setDots(1); return }
    const t = setInterval(() => setDots(d => d >= 3 ? 1 : d + 1), 450)
    return () => clearInterval(t)
  }, [urlLoading, aiThinking])

  /* focus input when booted */
  useEffect(() => { if (booted) inputRef.current?.focus() }, [booted])

  /* boot on open */
  useEffect(() => {
    if (!win?.isOpen) return
    setLines([]); setBooted(false); setInput('')
    setHistory([]); setHistIdx(-1); setHackRows(null)
    setAiActive(false); aiActiveRef.current = false; setInstallProgress(null)
    if (hackTimer.current)    clearInterval(hackTimer.current)
    if (installTimer.current) clearInterval(installTimer.current)

    const timers = BOOT.map(({ text, delay }) =>
      setTimeout(() => setLines(p => [...p, ln('system', text)]), delay)
    )
    const doneTimer = setTimeout(() => setBooted(true), 1900)
    return () => { timers.forEach(clearTimeout); clearTimeout(doneTimer) }
  }, [win?.isOpen])

  /* add lines with small staggered delay */
  const addLines = useCallback((newLines, gap = 18) => {
    newLines.forEach((line, i) => setTimeout(() => setLines(p => [...p, line]), i * gap))
  }, [])

  /* ── Command engine ─────────────────────────────────────────────── */
  const execute = useCallback((raw) => {
    const cmd   = raw.trim()
    if (!cmd) return
    setLines(p => [...p, ln('input', cmd)])
    setHistory(h => [cmd, ...h])
    setHistIdx(-1)
    setInput('')

    const lo = cmd.toLowerCase()

    /* raw URL — http/https/www/bare domain */
    if (URL_RE.test(cmd)) {
      const url = toUrl(cmd)
      addLines([ln('output', ''), ln('info', ` Launching ${url}...`)])
      setUrlLoading(true)
      setTimeout(() => {
        setUrlLoading(false)
        window.open(url, '_blank', 'noopener,noreferrer')
        addLines([ln('success', ' ✓ Opened successfully'), ln('output', '')])
      }, 2000)
      return
    }

    /* mikuda start */
    if (lo === 'mikuda start') {
      if (aiActiveRef.current) {
        addLines([ln('output', ''), ln('info', ' Mikuda AI is already running. Say anything!'), ln('output', '')])
        return
      }
      addLines([ln('output', ''), ln('info', ' Installing mikuda...')])
      let progress = 0
      setInstallProgress(0)
      installTimer.current = setInterval(() => {
        progress += 20
        setInstallProgress(progress)
        if (progress >= 100) {
          clearInterval(installTimer.current)
          setTimeout(() => {
            setInstallProgress(null)
            activateAi()
            addLines([
              ln('success', ' ✓ Mikuda AI is now active.'),
              ln('info',    " Say anything — I'm listening."),
              ln('output',  ''),
            ])
          }, 400)
        }
      }, 320)
      return
    }

    /* mikuda stop */
    if (lo === 'mikuda stop') {
      if (!aiActiveRef.current) {
        addLines([ln('output', ''), ln('error', ' Mikuda AI is not running. Type mikuda start to activate.'), ln('output', '')])
        return
      }
      deactivateAi()
      addLines([ln('output', ''), ln('info', ' Mikuda AI deactivated.'), ln('output', '')])
      return
    }

    /* mikuda (no subcommand) */
    if (lo === 'mikuda') {
      addLines([
        ln('output', ''),
        ln('info',    ' mikuda — AI assistant CLI'),
        ln('output',  ''),
        ln('jsx', <HelpRow cmd="mikuda start" desc="Activate AI mode" />),
        ln('jsx', <HelpRow cmd="mikuda stop"  desc="Deactivate AI mode" />),
        ln('output',  ''),
      ])
      return
    }

    /* clear */
    if (lo === 'clear') { setTimeout(() => setLines([]), 10); return }

    /* exit */
    if (lo === 'exit') {
      addLines([ln('output', ''), ln('info', "Goodbye. Don't forget to hire Ferdous. 👋"), ln('output', '')])
      setTimeout(() => { play('close'); closeWindow('terminal') }, 1300)
      return
    }

    /* hack */
    if (lo === 'hack') {
      addLines([ln('success', 'Initiating breach sequence...')])
      let frames = 0
      hackTimer.current = setInterval(() => {
        setHackRows(Array.from({ length: 6 }, () =>
          Array.from({ length: 56 }, () => MATRIX[Math.floor(Math.random() * MATRIX.length)]).join('')
        ))
        frames++
        if (frames >= 30) {
          clearInterval(hackTimer.current)
          setHackRows(null)
          addLines([
            ln('success', '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ BREACH COMPLETE'),
            ln('output',  ''),
            ln('output',  'Access granted. Welcome to the matrix. 🟢'),
            ln('output',  ''),
          ])
        }
      }, 100)
      return
    }

    /* help — also opens Terminal Help note on the right */
    if (lo === 'help') {
      useWindowStore.getState().openNoteRequest('help', 7)
      addLines([
        ln('output', ''),
        ln('info',   ' Available commands:'),
        ln('output', ''),
        ln('info',   '  Navigation ──────────────────────────────────────'),
        ln('jsx', <HelpRow cmd="help"          desc="List all available commands"       />),
        ln('jsx', <HelpRow cmd="about"         desc="Short bio & intro"                 />),
        ln('jsx', <HelpRow cmd="skills"        desc="Tech stack"                        />),
        ln('jsx', <HelpRow cmd="projects"      desc="List projects"                     />),
        ln('jsx', <HelpRow cmd="open <name>"   desc="Open a tool  (e.g. open finder)"   />),
        ln('jsx', <HelpRow cmd="contact"       desc="Email & social links"              />),
        ln('jsx', <HelpRow cmd="resume"        desc="View resume"                       />),
        ln('jsx', <HelpRow cmd="clear"         desc="Clear terminal"                    />),
        ln('jsx', <HelpRow cmd="whoami"        desc="Who are you?"                      />),
        ln('output', ''),
        ln('info',   '  Easter Eggs ──────────────────────────────────────'),
        ln('jsx', <HelpRow cmd="sudo hire me"  desc="👀"   />),
        ln('jsx', <HelpRow cmd="rm -rf life"   desc="💀"   />),
        ln('jsx', <HelpRow cmd="ls feelings"   desc="📂"   />),
        ln('jsx', <HelpRow cmd="ping happiness"desc="📡"   />),
        ln('jsx', <HelpRow cmd="git status"    desc="🌿"   />),
        ln('jsx', <HelpRow cmd="hack"          desc="Try it..." />),
        ln('jsx', <HelpRow cmd="date"          desc="Current date & time" />),
        ln('jsx', <HelpRow cmd="neofetch"      desc="System info" />),
        ln('jsx', <HelpRow cmd="coffee"        desc="☕" />),
        ln('jsx', <HelpRow cmd="exit"          desc="Close terminal" />),
        ln('output', ''),
        ln('info',   '  AI Mode ─────────────────────────────────────────'),
        ln('jsx', <HelpRow cmd="mikuda start" desc="Activate Mikuda AI (unknown cmds → AI)" />),
        ln('jsx', <HelpRow cmd="mikuda stop"  desc="Deactivate AI mode" />),
        ln('output', ''),
      ], 12)
      return
    }

    /* about */
    if (lo === 'about') {
      addLines([
        ln('output', ''),
        ln('success', " Hey, I'm Ferdous Mikdad 👋"),
        ln('output', ''),
        ln('output', ' UI/UX Designer & Frontend Developer.'),
        ln('output', ' I design and build beautiful, functional digital experiences.'),
        ln('output', ' Passionate about design systems, motion design, and clean code.'),
        ln('output', ''),
        ln('info',   " Currently open to new opportunities. Let's build something great."),
        ln('output', ''),
      ], 25)
      return
    }

    /* skills */
    if (lo === 'skills') {
      addLines([
        ln('output', ''),
        ln('info',   ' Tech Stack:'),
        ln('output', ''),
        ln('jsx', <KVRow k="Design"   v="Figma · Adobe XD · After Effects · Illustrator" />),
        ln('jsx', <KVRow k="Frontend" v="React · JavaScript · TypeScript · HTML/CSS"      />),
        ln('jsx', <KVRow k="Motion"   v="Framer Motion · GSAP · CSS Animations"           />),
        ln('jsx', <KVRow k="Tools"    v="Git · Vite · Tailwind CSS · VS Code"             />),
        ln('output', ''),
      ], 25)
      return
    }

    /* projects */
    if (lo === 'projects') {
      addLines([
        ln('output', ''),
        ln('info',   ' Projects:'),
        ln('output', ''),
        ln('output', ' Portfolio OS    — Interactive macOS-style portfolio site'),
        ln('output', ' Design Tools    — Color contrast, palette, retro effects & more'),
        ln('output', ' Brand Identity  — Logo & identity systems'),
        ln('output', ' Landing Pages   — High-conversion web designs'),
        ln('output', ''),
        ln('info',   " Type 'open portfolio' to browse all projects."),
        ln('output', ''),
      ], 25)
      return
    }

    /* contact */
    if (lo === 'contact') {
      addLines([
        ln('output', ''),
        ln('info',   ' Contact:'),
        ln('output', ''),
        ln('jsx', <KVRow k="Email"  v="mikdadtaqi2024@gmail.com"     />),
        ln('jsx', <KVRow k="GitHub" v="github.com/ferdousmikdad"     />),
        ln('output', ''),
      ], 25)
      return
    }

    /* resume */
    if (lo === 'resume') {
      addLines([
        ln('output', ''),
        ln('info',   ' Resume:'),
        ln('output', ''),
        ln('output', ' 📄  Coming soon — check back later!'),
        ln('output', ''),
      ], 30)
      return
    }

    /* whoami */
    if (lo === 'whoami') {
      addLines([ln('output', ''), ln('output', "You're a curious visitor 👀"), ln('output', '')], 25)
      return
    }

    /* date */
    if (lo === 'date') {
      addLines([
        ln('output', ''),
        ln('output', new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })),
        ln('output', ''),
      ], 25)
      return
    }

    /* neofetch */
    if (lo === 'neofetch') {
      const rows = [ln('output', '')]
      const max = Math.max(ASCII_ART.length, NFO_INFO.length)
      for (let i = 0; i < max; i++) {
        const a = ASCII_ART[i] ?? '                       '
        const n = NFO_INFO[i]
        rows.push(ln('jsx', (
          <span style={{ display: 'block', padding: '0 16px', fontFamily: FONT, fontSize: 12.5, lineHeight: '1.6' }}>
            <span style={{ color: G }}>{a}</span>
            {n && <span>{'  '}<NfoInfo row={n} /></span>}
          </span>
        )))
      }
      rows.push(ln('output', ''))
      addLines(rows, 28)
      return
    }

    /* coffee */
    if (lo === 'coffee') {
      addLines([
        ln('output', ''),
        ln('info',    ' Brewing...'),
      ])
      setTimeout(() => addLines([ln('success', ' ☕  Done. Focus +100'), ln('output', '')]), 800)
      return
    }

    /* easter eggs */
    if (lo === 'sudo hire me') {
      addLines([
        ln('output', ''),
        ln('success', '[sudo] password for hiring_manager: ********'),
        ln('output',  ''),
      ])
      setTimeout(() => addLines([
        ln('success', ' ✓ Permission granted.'),
        ln('output',  '   Forwarding your offer to ferdous...'),
        ln('output',  ''),
        ln('info',    '   📬 Offer received! Response time: < 24h'),
        ln('output',  ''),
      ], 220), 600)
      return
    }

    if (lo === 'rm -rf life') {
      addLines([
        ln('output', ''),
        ln('error',  " rm: cannot remove 'life': Permission denied"),
        ln('output', ' Nice try. Life restored from backup. ♻️'),
        ln('output', ''),
      ], 40)
      return
    }

    if (lo === 'ls feelings') {
      addLines([
        ln('output', ''),
        ln('success', ' confidence/   ambition/    coffee/       more_coffee/'),
        ln('output',  ' passion/      curiosity/   late_nights/  clean_code/'),
        ln('output',  ''),
      ], 30)
      return
    }

    if (lo === 'ping happiness') {
      addLines([
        ln('output', ''),
        ln('info',   ' PING happiness (127.0.0.1): 56 data bytes'),
        ln('success',' 64 bytes from happiness: icmp_seq=0 ttl=64 time=0.042 ms'),
        ln('success',' 64 bytes from happiness: icmp_seq=1 ttl=64 time=0.038 ms'),
        ln('success',' 64 bytes from happiness: icmp_seq=2 ttl=64 time=0.041 ms'),
        ln('output',  ''),
        ln('output',  ' Reply from happiness: time=0ms (working from home) ✅'),
        ln('output',  ''),
      ], 140)
      return
    }

    if (lo === 'git status') {
      addLines([
        ln('output',  ''),
        ln('success', " On branch: main"),
        ln('output',  " Your branch is up to date with 'origin/main'."),
        ln('output',  ''),
        ln('info',    ' Changes not staged for commit:'),
        ln('error',   '   modified:   life/goals.md'),
        ln('error',   '   modified:   sleep/schedule.md'),
        ln('output',  ''),
        ln('success', ' Uncommitted changes: 1 (life goals)'),
        ln('output',  ''),
      ], 35)
      return
    }

    /* open <target> */
    if (lo.startsWith('open ')) {
      const target = cmd.slice(5).trim()

      /* open <url> — http/https/www/bare domain */
      if (URL_RE.test(target)) {
        const url = toUrl(target)
        addLines([ln('output', ''), ln('info', ` Launching ${url}...`)])
        setUrlLoading(true)
        setTimeout(() => {
          setUrlLoading(false)
          window.open(url, '_blank', 'noopener,noreferrer')
          addLines([ln('success', ' ✓ Opened successfully'), ln('output', '')])
        }, 2000)
        return
      }

      const targetLo = target.toLowerCase()
      const tool = TOOLS.find(t => t.id === targetLo || t.name.toLowerCase() === targetLo)
      if (tool) {
        addLines([ln('output', ''), ln('success', ` Opening ${tool.name}...`), ln('output', '')])
        setTimeout(() => { play('open'); openTool(tool.id) }, 400)
        return
      }
      const native = { finder: 'finder', notes: 'notes', portfolio: 'portfolio', shop: 'shop', terminal: 'terminal' }
      if (native[targetLo]) {
        addLines([ln('output', ''), ln('success', ` Opening ${targetLo}...`), ln('output', '')])
        setTimeout(() => { play('open'); openWindow(native[targetLo]) }, 400)
        return
      }
      addLines([
        ln('output', ''),
        ln('error',  ` open: ${target}: No such application`),
        ln('info',   ' Available: ' + TOOLS.map(t => t.id).join(', ') + ', finder, notes, portfolio'),
        ln('output', ''),
      ])
      return
    }

    /* unknown — ask AI only if active, else command not found */
    if (!aiActiveRef.current) {
      addLines([
        ln('output', ''),
        ln('error',  ` command not found: ${cmd}`),
        ln('info',   " Type 'mikuda start' to enable AI, or 'help' for commands."),
        ln('output', ''),
      ])
      return
    }

    setAiThinking(true)
    fetch('https://delicate-lab-1163.mikdadtaqi2024.workers.dev/terminal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: cmd }),
    })
      .then(r => r.json())
      .then(data => {
        setAiThinking(false)
        const reply = (data.reply || '').trim()
        if (!reply) {
          addLines([ln('output', ''), ln('error', ` command not found: ${cmd}`), ln('info', " Type 'help' for available commands."), ln('output', '')])
          return
        }
        const replyLines = reply.split('\n').filter(Boolean)
        addLines([ln('output', ''), ...replyLines.map(l => ln('output', ' ' + l)), ln('output', '')])
      })
      .catch(() => {
        setAiThinking(false)
        addLines([
          ln('output', ''),
          ln('error', ` command not found: ${cmd}`),
          ln('info',  " Type 'help' for available commands."),
          ln('output', ''),
        ])
      })
  }, [addLines, closeWindow, openWindow, openTool, play])

  /* keyboard */
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      execute(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx); setInput(history[idx] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx); setInput(idx === -1 ? '' : history[idx])
    }
  }

  return (
    <Window id="terminal" title="ferdous@portfolio ~ — zsh">
      <div
        onClick={() => inputRef.current?.focus()}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', background: BG, cursor: 'text' }}
      >
        {/* ── Scrollable output + inline input ── */}
        <div ref={scrollRef} className="window-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 10, paddingBottom: 12 }}>
          {lines.map(line => <Line key={line.id} line={line} />)}

          {/* mikuda install progress bar */}
          {installProgress !== null && (
            <div style={{ fontFamily: FONT, fontSize: 12.5, lineHeight: '1.6', padding: '0 16px' }}>
              <span style={{ color: G }}>{'▓'.repeat(Math.floor(installProgress / 5))}</span>
              <span style={{ color: D }}>{'░'.repeat(20 - Math.floor(installProgress / 5))}</span>
              <span style={{ color: W }}> {installProgress}%</span>
            </div>
          )}

          {/* animated loading indicators */}
          {urlLoading && (
            <div style={{ fontFamily: FONT, fontSize: 12.5, lineHeight: '1.6', padding: '0 16px', color: G }}>
              {' Opening in new tab '}{'.'.repeat(dots)}
            </div>
          )}
          {aiThinking && (
            <div style={{ fontFamily: FONT, fontSize: 12.5, lineHeight: '1.6', padding: '0 16px', color: D }}>
              {' thinking'}{'.'.repeat(dots)}
            </div>
          )}

          {/* matrix hack rows */}
          {hackRows && hackRows.map((row, i) => (
            <div key={i} style={{ fontFamily: FONT, fontSize: 12.5, lineHeight: '1.5', padding: '0 16px', color: '#00ff41', letterSpacing: 1 }}>
              {row}
            </div>
          ))}

          {/* inline prompt — flows after output */}
          {booted && (
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', marginTop: 2 }}>
              <span style={{ fontFamily: FONT, fontSize: 12.5, whiteSpace: 'pre', userSelect: 'none' }}>
                <span style={{ color: G }}>{PROMPT}</span>
                {aiActive && <span style={{ color: C }}>/mikuda </span>}
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: W, fontFamily: FONT, fontSize: 12.5, caretColor: G,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Window>
  )
}
