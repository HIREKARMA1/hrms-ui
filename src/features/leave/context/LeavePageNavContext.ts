/**
 * React context for HR cross-tab navigation intents.
 */

import { createContext } from 'react'

import type { LeavePageNavIntent } from './leavePageNavTypes'

export type LeavePageNavContextValue = {
  intent: LeavePageNavIntent | null
  setIntent: (next: LeavePageNavIntent | null) => void
  consumeIntent: () => LeavePageNavIntent | null
}

export const LeavePageNavContext = createContext<LeavePageNavContextValue | null>(null)
