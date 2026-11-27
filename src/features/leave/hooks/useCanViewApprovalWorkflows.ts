import { useAppSelector } from '@/app/store/hooks'

import { selectAccessToken } from '@/features/auth/store/authSlice'



import { useShouldFetchLeaveList } from './useShouldFetchLeaveList'



/** GET /leave-approval/workflows (Swagger: list; typically leaves:read). */

export function useCanViewApprovalWorkflows(): boolean {

  const token = useAppSelector(selectAccessToken)

  const canReadLeaves = useShouldFetchLeaveList()

  return Boolean(token && canReadLeaves)

}
