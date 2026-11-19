import { useAppSelector } from '@/app/store/hooks'
import { selectCurrentUser } from '@/features/auth/store/authSlice'

import type { LeaveSnapshot } from '../services/leaveService'
import { resolveLeaveApiEmployeeId } from '../utils/leaveApiEmployeeId'

/**
 * Resolves backend employee id for self-service leave APIs (My Leave).
 * Pass `contextEmployeeId` when resolving for a selected row (e.g. HR ledger).
 */
export function useLeaveEmployeeIdForApi(
  snapshot: LeaveSnapshot | null | undefined,
  contextEmployeeId?: string | null,
): string | null {
  const user = useAppSelector(selectCurrentUser)
  return resolveLeaveApiEmployeeId(snapshot, user, contextEmployeeId)
}