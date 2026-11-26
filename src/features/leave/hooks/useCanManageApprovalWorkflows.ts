import { useAppSelector } from '@/app/store/hooks'

import { selectAccessToken } from '@/features/auth/store/authSlice'



import { useLeavePermissions } from './useLeavePermissions'



/** POST/PATCH/DELETE /leave-approval/workflows (Swagger: manage; mapped to leave_types:update). */

export function useCanManageApprovalWorkflows(): boolean {

  const token = useAppSelector(selectAccessToken)

  const { canUpdateLeaveTypes } = useLeavePermissions()

  return Boolean(token && canUpdateLeaveTypes)

}
