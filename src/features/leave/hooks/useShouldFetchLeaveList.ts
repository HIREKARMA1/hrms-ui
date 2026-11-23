import { useAppSelector } from '@/app/store/hooks'
import {
  selectAccessToken,
  selectCurrentUser,
} from '@/features/auth/store/authSlice'

import { LEAVES_READ_PERMISSION } from '../constants/leaveApiAccess'

/** True when the client may call `GET /leaves`. */
export function useShouldFetchLeaveList(): boolean {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  return Boolean(
    token && user?.permissions.includes(LEAVES_READ_PERMISSION),
  )
}