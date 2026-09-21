import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import { Icon, type IconName } from './Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-white text-black border border-white shadow-sm hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
  secondary: 'bg-[#141414] text-white border border-[#262626] hover:bg-[#222222] active:scale-[0.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-white border border-transparent hover:bg-[#141414] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed',
  destructive: 'bg-[#200b0b] text-[#ff6b6b] border border-[#5c1d1d] hover:bg-[#301010] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 gap-1.5 rounded-full px-4 text-[13px]',
  md: 'h-11 gap-2 rounded-full px-6 text-[14px]',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
  full?: boolean
}

export function Button({ variant='secondary', size='md', icon, iconRight, full, className, children, type='button', ...rest }: ButtonProps){
  const iconSize = size==='sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <button type={type} className={cx('inline-flex select-none items-center justify-center font-medium leading-none transition-all duration-150','focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2','disabled:cursor-not-allowed',VARIANTS[variant],SIZES[size],full&&'w-full',className)} {...rest}>
      {icon && <Icon name={icon} className={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} className={iconSize} />}
    </button>
  )
}
