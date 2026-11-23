/**
 * React context typing for leave snapshot and reload actions.
 * Provided by LeaveProvider wrapping LeavePage.
 */

import { createContext } from 'react'

import type { LeaveSnapshot } from '../services/leaveService'

export type LeaveContextValue = {
  loading: boolean
  error: string | null
  snapshot: LeaveSnapshot | null
  reload: () => Promise<void>
}

export const LeaveContext = createContext<LeaveContextValue | null>(null)
