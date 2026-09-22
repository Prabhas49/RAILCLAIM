import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from './Icon'
import { cx } from '../../lib/cx'

export interface SelectOption {
  value: string
  label?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function Select({ value, onChange, options, placeholder = 'Select…', className }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const select = (opt: SelectOption) => {
    onChange(opt.value)
    setOpen(false)
  }

  const move = (delta: number) => {
    setHighlighted((h) => (h + delta + options.length) % options.length)
  }

  return (
    <div ref={rootRef} className={cx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (!open) {
              setOpen(true)
              setHighlighted(0)
            } else move(1)
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (!open) {
              setOpen(true)
              setHighlighted(options.length - 1)
            } else move(-1)
          }
          if (e.key === 'Enter' && open) {
            e.preventDefault()
            if (options[highlighted]) select(options[highlighted])
          }
        }}
        className={cx(
          'flex w-full cursor-pointer items-center justify-between rounded-lg border bg-[#000000] px-4 py-3 text-left text-sm font-medium text-white focus:outline-none',
          open ? 'border-white' : 'border-[#262626]',
        )}
      >
        <span className={value ? '' : 'text-[#71717a] font-normal'}>{value || placeholder}</span>
        <Icon
          name="chevronDown"
          className={cx('h-4 w-4 shrink-0 text-[#71717a] transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-[#262626] bg-[#111111] py-1.5 shadow-elevation"
          >
            {options.map((opt, i) => (
              <button
                key={opt.value}
                type="button"
                ref={(el) => {
                  if (el && i === highlighted) el.scrollIntoView({ block: 'nearest' })
                }}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => select(opt)}
                className={cx(
                  'block w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors',
                  i === highlighted ? 'bg-white/10 text-white' : 'text-[#d4d4d8]',
                )}
              >
                {opt.label ?? opt.value}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
