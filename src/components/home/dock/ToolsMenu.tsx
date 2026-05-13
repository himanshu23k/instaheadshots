import { useEffect, useRef } from 'react'
import { Sparkles, Frame, Pencil, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tool = { id: string; label: string; Icon: LucideIcon }

const TOOLS: Tool[] = [
  { id: 'imagine', label: 'Imagine', Icon: Sparkles },
  { id: 'use-look', label: 'Use a Look', Icon: Frame },
  { id: 'edit-photo', label: 'Edit a photo', Icon: Pencil },
]

type Props = {
  open: boolean
  onClose: () => void
  returnFocusRef?: React.RefObject<HTMLElement | null>
}

export function ToolsMenu({ open, onClose, returnFocusRef }: Props) {
  const menuRef = useRef<HTMLUListElement | null>(null)

  // Focus trap and Escape close.
  useEffect(() => {
    if (!open) return
    const menu = menuRef.current
    if (!menu) return
    const items = Array.from(
      menu.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
    )
    items[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        returnFocusRef?.current?.focus()
        return
      }
      if (e.key === 'Tab') {
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, returnFocusRef])

  const handleSelect = (id: string) => {
    console.log('[home] tool selected:', id)
    onClose()
    returnFocusRef?.current?.focus()
  }

  // Stagger from bottom to top so the closest item to the CTA appears first.
  const ordered = [...TOOLS].reverse()

  return (
    <ul
      ref={menuRef}
      role="menu"
      aria-label="Tools"
      aria-hidden={!open}
      className={cn(
        'absolute right-0 bottom-[72px] z-40 flex flex-col items-end gap-2',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      {ordered.map((tool, i) => {
        const { Icon } = tool
        return (
          <li key={tool.id} role="none">
            <button
              type="button"
              role="menuitem"
              tabIndex={open ? 0 : -1}
              onClick={() => handleSelect(tool.id)}
              className={cn(
                'flex items-center gap-2 h-11 pl-3 pr-4 bg-button-primary-default text-text-white',
                'text-14 font-medium leading-18 whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight focus-visible:ring-offset-2',
                'transition-[opacity,transform] will-change-transform',
              )}
              style={{
                boxShadow: 'var(--shadow-02)',
                opacity: open ? 1 : 0,
                transform: open
                  ? 'translateY(0) scale(1)'
                  : 'translateY(8px) scale(0.94)',
                transitionDuration: '260ms',
                transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                transitionDelay: `${(open ? i : ordered.length - 1 - i) * 40}ms`,
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tool.label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
