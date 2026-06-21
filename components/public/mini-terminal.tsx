'use client'

import { cn } from '@/lib/utils'

export type TerminalTone = 'green' | 'yellow' | 'blue'

const toneClass: Record<TerminalTone, string> = {
  green: 'text-green',
  yellow: 'text-yellow',
  blue: 'text-blue',
}

/**
 * MiniTerminal — a slim neobrutalist code surface (the only dark zone permitted
 * on the public/auth pages, code-only). The typed command and the result line
 * are REAL DOM text; the blinking caret is decorative (aria-hidden) and is
 * frozen steady under prefers-reduced-motion via the `.terminal-caret` rule.
 */
export function MiniTerminal({
  command,
  result,
  resultTone = 'green',
  caret = true,
  label = 'TERMINAL',
  className,
}: {
  command: string
  result?: string
  resultTone?: TerminalTone
  caret?: boolean
  label?: string
  className?: string
}) {
  return (
    <div className={cn('cabinet-surface overflow-hidden brutal-border brutal-radius', className)}>
      <div className="flex items-center gap-2 border-b-3 border-black/60 px-3 py-1.5">
        <span className="flex gap-1" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow" />
          <span className="h-2.5 w-2.5 rounded-full bg-green" />
        </span>
        <span className="hud-label text-[10px] text-on-dark-soft">{label}</span>
      </div>
      <div className="metric-mono px-3 py-3 text-[13px] leading-relaxed">
        <p className="text-on-dark">
          <span className="text-on-dark-soft">$</span> {command}
          {caret && (
            <span className="terminal-caret ml-0.5 h-[1em] align-[-0.15em] text-on-dark" aria-hidden="true">
              &nbsp;
            </span>
          )}
        </p>
        {result && (
          <p className={cn('mt-1 font-bold', toneClass[resultTone])}>{result}</p>
        )}
      </div>
    </div>
  )
}

export default MiniTerminal
