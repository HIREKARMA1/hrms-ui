/**
 * Provider for HR cross-tab navigation intents.
 */

import { useMemo, useState, type ReactNode } from 'react'

import type { LeavePageNavIntent } from './leavePageNavTypes'
import { LeavePageNavContext, type LeavePageNavContextValue } from './LeavePageNavContext'

export function LeavePageNavProvider({ children }: { children: ReactNode }) {
  const [intent, setIntent] = useState<LeavePageNavIntent | null>(null)

  const value = useMemo((): LeavePageNavContextValue => ({ intent, setIntent, consumeIntent: () => intent }), [intent])

  return <LeavePageNavContext.Provider value={value}>{children}</LeavePageNavContext.Provider>
}
