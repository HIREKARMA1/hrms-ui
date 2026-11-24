/**
 * True when the user may POST /calendar/holidays/{id}/notify.
 */
import { useAppSelector } from '@/app/store/hooks'
import { selectAccessToken, selectCurrentUser } from '@/features/auth/store/authSlice'

import { HOLIDAYS_NOTIFY_PERMISSION, HOLIDAYS_READ_PERMISSION } from '../constants/holidaysApiAccess'

export function useCanNotifyHoliday(): boolean {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  const permissions = user?.permissions ?? []
  return Boolean(
    token &&
      permissions.includes(HOLIDAYS_READ_PERMISSION) &&
      permissions.includes(HOLIDAYS_NOTIFY_PERMISSION),
  )
}