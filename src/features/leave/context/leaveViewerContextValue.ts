/**
 * React context for shared demo leave viewer (no component exports).
 */

import { createContext } from 'react'

import type { UserRole } from '../constants/userRoles'
import type { LeaveViewer } from '../types/viewer'

export type LeaveViewerContextValue = {
  viewer: LeaveViewer
  role: UserRole
  setViewerRole: (role: UserRole) => void
}

export const LeaveViewerContext = createContext<LeaveViewerContextValue | null>(null)
