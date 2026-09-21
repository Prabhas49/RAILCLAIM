import type { ReactNode } from 'react'

export type IconName =
  | 'grid'
  | 'mic'
  | 'sparkle'
  | 'clipboard'
  | 'building'
  | 'shield'
  | 'check'
  | 'circleCheck'
  | 'alert'
  | 'circleX'
  | 'x'
  | 'camera'
  | 'pin'
  | 'clock'
  | 'user'
  | 'download'
  | 'play'
  | 'arrowRight'
  | 'refresh'
  | 'plus'
  | 'bolt'
  | 'layers'
  | 'hash'
  | 'eye'
  | 'lock'
  | 'translate'
  | 'scan'
  | 'filter'
  | 'activity'
  | 'trendUp'
  | 'info'
  | 'send'
  | 'cpu'
  | 'file'
  | 'chevronRight'
  | 'chevronDown'
  | 'chevronLeft'
  | 'bell'
  | 'search'
  | 'calendar'
  | 'database'
  | 'gauge'
  | 'home'
  | 'sparkles'
  | 'history'
  | 'export'

const PATHS: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5L12 3.5l9 7v9.5a1.5 1.5 0 0 1-1.5 1.5h-3V14a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 7.5 14v6.5h-3A1.5 1.5 0 0 1 3 19z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.5l1.7 4.9 4.8 1.6-4.8 1.6L12 16.5l-1.7-4.9L5.5 10l4.8-1.6z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
      <path d="M5 15.5l.7 1.9 1.9.7-1.9.7L5 20.7l-.7-1.9L2.4 18l1.9-.7z" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2V12l3.2 2" />
      <path d="M8.5 5.2l1.2 1.8M15.5 5.2l-1.2 1.8" />
    </>
  ),
  export: (
    <>
      <path d="M12 3.8v11" />
      <path d="M8 11.2l4 4 4-4" />
      <path d="M4.5 20.2h15" />
      <path d="M7 7.5H6a1 1 0 0 0-1 1v1" />
      <path d="M18 7.5h1a1 1 0 0 1 1 1v1" />
    </>
  ),
  mic: (
    <>
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5l1.7 4.9 4.8 1.6-4.8 1.6L12 16.5l-1.7-4.9L5.5 10l4.8-1.6z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 4.5H7.5A2 2 0 0 0 5.5 6.5v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-12a2 2 0 0 0-2-2H15" />
      <rect x="9" y="2.5" width="6" height="4" rx="1.4" />
      <path d="M9 12.5l2 2 4-4" />
    </>
  ),
  building: (
    <>
      <path d="M4 21h16" />
      <path d="M6 21V5.5A1.5 1.5 0 0 1 7.5 4h6A1.5 1.5 0 0 1 15 5.5V21" />
      <path d="M15 10h2.5A1.5 1.5 0 0 1 19 11.5V21" />
      <path d="M9 8h3M9 12h3M9 16h3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7.5 3v5.4c0 4.6-3.1 7.9-7.5 9.6-4.4-1.7-7.5-5-7.5-9.6V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  circleCheck: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.2 12.3l2.6 2.6 5-5.4" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 4.3 2.8 17.2A1.9 1.9 0 0 0 4.4 20h15.2a1.9 1.9 0 0 0 1.6-2.8L13.7 4.3a1.9 1.9 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4" />
      <path d="M12 16.6h.01" />
    </>
  ),
  circleX: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  camera: (
    <>
      <path d="M4 8.5h2.8L8.4 6h7.2l1.6 2.5H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10.2" r="2.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.8v11" />
      <path d="M8 11.2l4 4 4-4" />
      <path d="M4.5 20.2h15" />
    </>
  ),
  play: <path d="M8 5.5l11 6.5-11 6.5z" />,
  arrowRight: (
    <>
      <path d="M4.5 12h15" />
      <path d="M13.5 6l6 6-6 6" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11.5a8 8 0 1 0-2.4 5.7" />
      <path d="M20 4.5v7h-7" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  bolt: <path d="M13.2 2.5 5.5 13.4h5.4l-1.1 8.1 7.8-11h-5.4z" />,
  layers: (
    <>
      <path d="M12 3.2 3 7.8l9 4.6 9-4.6z" />
      <path d="M3 12.4l9 4.6 9-4.6" />
      <path d="M3 16.6l9 4.6 9-4.6" />
    </>
  ),
  hash: (
    <>
      <path d="M9.5 3.5 7.5 20.5M16.5 3.5l-2 17" />
      <path d="M4 8.8h16M3.4 15.2h16" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6.2 6 12 6s9.5 6 9.5 6-3.7 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.7" />
    </>
  ),
  lock: (
    <>
      <rect x="4.8" y="10.5" width="14.4" height="9.5" rx="2" />
      <path d="M8.3 10.5V8a3.7 3.7 0 0 1 7.4 0v2.5" />
    </>
  ),
  translate: (
    <>
      <path d="M3.5 5.5h9" />
      <path d="M8 5.5c0 5-1.8 8.2-5 10.2" />
      <path d="M6.4 11.2c1.4 2.7 3.7 4.5 6.1 5.3" />
      <path d="M12.8 20.5 16.5 11l3.7 9.5" />
      <path d="M14.2 17.4h4.6" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5" />
      <path d="M20 8.5V6a2 2 0 0 0-2-2h-2.5" />
      <path d="M4 15.5V18a2 2 0 0 0 2 2h2.5" />
      <path d="M20 15.5V18a2 2 0 0 1-2 2h-2.5" />
      <path d="M3.5 12h17" />
    </>
  ),
  filter: <path d="M3.5 5.5h17l-6.6 7.6v6l-3.8-2v-4z" />,
  activity: <path d="M2.5 12.5h4l2.5-6.5 4 12 2.6-5.5h5.9" />,
  trendUp: (
    <>
      <path d="M3.5 17 9.5 11l4 4 7-7" />
      <path d="M15.5 8h5v5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.8h.01" />
    </>
  ),
  send: (
    <>
      <path d="M21.5 2.5 10.8 13.2" />
      <path d="M21.5 2.5 14.8 21.5l-4-8.3-8.3-4z" />
    </>
  ),
  cpu: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2.2" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
      <path d="M10 3.5v3M14 3.5v3M10 17.5v3M14 17.5v3M3.5 10h3M3.5 14h3M17.5 10h3M17.5 14h3" />
    </>
  ),
  file: (
    <>
      <path d="M6.5 3.5h7.2l4.3 4.3V20a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5z" />
      <path d="M13.5 3.5v4.5H18" />
    </>
  ),
  chevronRight: <path d="M9.5 5.5l6.5 6.5-6.5 6.5" />,
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  chevronLeft: <path d="M14.5 5.5l-6.5 6.5 6.5 6.5" />,
  bell: (
    <>
      <path d="M12 21a2.5 2.5 0 0 0 2.5-2.5H9.5A2.5 2.5 0 0 0 12 21Z" />
      <path d="M5.5 16.5V14a6.5 6.5 0 0 1 6.5-6.5A6.5 6.5 0 0 1 18.5 14v2.5H5.5Z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="M15.5 15.5 20.5 20.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6.2" rx="7.5" ry="3" />
      <path d="M4.5 6.2v11.6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6.2" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 17.5a9 9 0 1 1 16 0" />
      <path d="M12 13.5l3.8-3.8" />
      <circle cx="12" cy="15.2" r="1.6" />
    </>
  ),
}

const FILLED: IconName[] = ['play', 'bolt', 'filter']

interface IconProps {
  name: IconName
  className?: string
  strokeWidth?: number
}

export function Icon({ name, className = 'h-4 w-4', strokeWidth = 1.7 }: IconProps) {
  const filled = FILLED.includes(name)
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0.8 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
