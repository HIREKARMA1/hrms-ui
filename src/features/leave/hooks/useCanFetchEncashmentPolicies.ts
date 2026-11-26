import { useAppSelector } from '@/app/store/hooks'

import { selectAccessToken } from '@/features/auth/store/authSlice'



import { useLeavePermissions } from './useLeavePermissions'



/** True when GET /leave-encashments/policies is allowed (leave_encashments:approve). */

export function useCanFetchEncashmentPolicies(): boolean {

  const token = useAppSelector(selectAccessToken)

  const { canApproveEncashment } = useLeavePermissions()

  return Boolean(token && canApproveEncashment)

}
