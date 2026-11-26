import { cn } from '@/lib/utils'

import { leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

const STICKY_EDGE = 'shadow-[4px_0_10px_-4px_rgba(23,33,58,0.12)]'

/** Sticky first column (leave type) on horizontally scrolled policy tables. */
export function policyStickyTh(extra?: string) {
  return cn(
    leaveThClass('left', extra),
    'sticky left-0 z-10 bg-hrms-muted-bg',
    STICKY_EDGE,
  )
}

export function policyStickyTd(extra?: string) {
  return cn(
    leaveTdClass('left', extra),
    'sticky left-0 z-[1] bg-white group-hover:bg-hrms-row-hover',
    STICKY_EDGE,
  )
}