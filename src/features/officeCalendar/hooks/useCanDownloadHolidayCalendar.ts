/**
 * True when the user may GET /calendar/holidays/download.
 */
import { useAppSelector } from '@/app/store/hooks'
import { selectAccessToken, selectCurrentUser } from '@/features/auth/store/authSlice'

import { HOLIDAYS_CALENDAR_DOWNLOAD_PERMISSION } from '../constants/holidaysApiAccess'

export function useCanDownloadHolidayCalendar(): boolean {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  return Boolean(token && user?.permissions.includes(HOLIDAYS_CALENDAR_DOWNLOAD_PERMISSION))
}