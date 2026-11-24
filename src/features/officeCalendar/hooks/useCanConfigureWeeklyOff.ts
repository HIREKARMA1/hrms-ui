/**
 * True when the user may POST /calendar/weekly-offs (replace company policy).
 */
import { useAppSelector } from '@/app/store/hooks'
import { selectAccessToken, selectCurrentUser } from '@/features/auth/store/authSlice'

import {
  CALENDAR_CONFIGURE_PERMISSION,
  CALENDAR_READ_PERMISSION,
} from '../constants/calendarApiAccess'

export function useCanConfigureWeeklyOff(): boolean {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  const permissions = user?.permissions ?? []
  return Boolean(
    token &&
      permissions.includes(CALENDAR_READ_PERMISSION) &&
      permissions.includes(CALENDAR_CONFIGURE_PERMISSION),
  )
}