import { useAppSelector } from '@/app/store/hooks'
import { selectAccessToken, selectCurrentUser } from '@/features/auth/store/authSlice'

import { HOLIDAYS_READ_PERMISSION } from '../constants/holidaysApiAccess'

/** True when the client may call GET /holidays. */
export function useShouldFetchHolidays(): boolean {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  return Boolean(token && user?.permissions.includes(HOLIDAYS_READ_PERMISSION))
}