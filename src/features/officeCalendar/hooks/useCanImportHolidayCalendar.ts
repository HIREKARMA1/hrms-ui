/**
 * True when the user may POST /calendar/holidays/import.
 */
import { useAppSelector } from '@/app/store/hooks'
import { selectAccessToken, selectCurrentUser } from '@/features/auth/store/authSlice'

import { HOLIDAYS_CREATE_PERMISSION } from '../constants/holidaysApiAccess'

export function useCanImportHolidayCalendar(): boolean {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  return Boolean(token && user?.permissions.includes(HOLIDAYS_CREATE_PERMISSION))
}