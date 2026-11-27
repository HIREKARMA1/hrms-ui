import { useAppSelector } from '@/app/store/hooks'
import { selectAccessToken } from '@/features/auth/store/authSlice'

import { useLeavePermissions } from './useLeavePermissions'

/** True when GET /leave-encashments (list/detail) is allowed (leave_encashments:read). */
export function useCanFetchLeaveEncashments(): boolean {
  const token = useAppSelector(selectAccessToken)
  const { canViewEncashments } = useLeavePermissions()
  return Boolean(token && canViewEncashments)
}