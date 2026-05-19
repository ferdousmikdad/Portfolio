import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Trash2 } from 'lucide-react'
import Window from '@/components/window/Window'
import useWindowStore from '@/store/windowStore'

// ── Header field row ──────────────────────────────────────────────────────────

function FieldRow({ label, value, onChange, placeholder, readOnly, inputRef }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 20px', minHeight: 44,
      }}>
      <span style={{
        width: 58, flexShrink: 0,
        fontSize: 13, fontWeight: 500,
        color: 'var(--body)', opacity: 0.5,
        fontFamily: "'SF Pro Text'",
        userSelect: 'none',
      }}>
        {label}
      </span>
      {readOnly ? (
        <span style={{
          fontSize: 13, color: 'var(--body)', opacity: 0.75,
          fontFamily: "'SF Pro Text'",
        }}>
          {value}
        </span>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 13, color: 'var(--headline)', fontFamily: "'SF Pro Text'",
            caretColor: 'var(--brand)',
          }}
        />
      )}
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '0 20px' }} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MailWindow() {
  const mailTo     = useWindowStore(s => s.mailTo)
  const clearMailTo = useWindowStore(s => s.clearMailTo)
  const closeWindow = useWindowStore(s => s.closeWindow)

  const [to,      setTo]      = useState('')
  const [subject, setSubject] = useState('')
  const [body,    setBody]    = useState('')

  const toRef = useRef(null)

  // Populate To field whenever the window is opened with a recipient
  useEffect(() => {
    if (!mailTo) return
    setTo(mailTo)
    clearMailTo()
  }, [mailTo])

  const canSend = to.trim().length > 0 && body.trim().length > 0

  const handleDiscard = () => {
    setTo(''); setSubject(''); setBody('')
    closeWindow('mail')
  }

  // Toolbar: discard + send
  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={handleDiscard}
        title="Discard"
        style={{
          width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(128,128,128,0.1)',
          border: '1px solid rgba(128,128,128,0.15)',
          color: 'var(--body)',
          transition: 'opacity 0.15s',
        }}
      >
        <Trash2 size={13} />
      </button>

      <button
        onClick={() => { /* user will wire later */ }}
        disabled={!canSend}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 14px', borderRadius: 6, height: 28,
          background: canSend ? 'var(--brand)' : 'rgba(128,128,128,0.12)',
          color: canSend ? '#fff' : 'var(--body)',
          fontSize: 12, fontWeight: 600, fontFamily: "'SF Pro Text'",
          cursor: canSend ? 'pointer' : 'default',
          border: 'none',
          opacity: canSend ? 1 : 0.45,
          transition: 'all 0.15s',
        }}
      >
        <Send size={12} />
        Send
      </button>
    </div>
  )

  return (
    <Window id="mail" title="New Message" toolbar={toolbar}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Header fields ── */}
        <FieldRow
          label="To"
          value={to}
          onChange={setTo}
          inputRef={toRef}
        />
        <FieldRow
          label="From"
          value="ferdousmikdad@gmail.com"
          readOnly
        />
        <FieldRow
          label="Subject"
          value={subject}
          onChange={setSubject}
        />

        {/* ── Body ── */}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your message here…"
          className="mail-body"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            resize: 'none', padding: '14px 20px',
            fontSize: 13, lineHeight: 1.65,
            color: 'var(--headline)', fontFamily: "'SF Pro Text'",
            caretColor: 'var(--brand)',
          }}
        />

        {/* ── Footer bar ── */}
        <div style={{ height: 1, background: 'var(--border)', margin: '0 20px', flexShrink: 0 }} />
        <div style={{
          height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', flexShrink: 0,
        }}>
          <button
            title="Attach file (coming soon)"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: 'var(--body)', opacity: 0.45,
              fontFamily: "'SF Pro Text'", cursor: 'default',
              background: 'none', border: 'none',
            }}
          >
            <Paperclip size={12} />
            Attach
          </button>
          <span style={{ fontSize: 11, color: 'var(--body)', opacity: 0.3, fontFamily: "'SF Pro Text'" }}>
            {body.length > 0 ? `${body.length} chars` : ''}
          </span>
        </div>

      </div>
    </Window>
  )
}
