/**
 * True when the user may call GET /calendar/export (read + export permissions).
 */
import { useAppSelector } from '@/app/store/hooks'
import { selectAccessToken, selectCurrentUser } from '@/features/auth/store/authSlice'

import { CALENDAR_READ_PERMISSION } from '../constants/calendarApiAccess'
import { CALENDAR_EXPORT_PERMISSION } from '../constants/calendarExportAccess'

export function useCanExportCalendar(): boolean {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  const permissions = user?.permissions ?? []
  return Boolean(
    token &&
      permissions.includes(CALENDAR_READ_PERMISSION) &&
      permissions.includes(CALENDAR_EXPORT_PERMISSION),
  )
}