/**
 * Toast callback context for leave page action feedback.
 * Provided by LeaveToastProvider on LeavePage.
 */

import { createContext } from 'react'

export type LeaveToastContextValue = {
  showToast: (text: string) => void
}

export const LeaveToastContext = createContext<LeaveToastContextValue | null>(null)
