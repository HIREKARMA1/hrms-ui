import { useAppSelector } from '@/app/store/hooks'

import { selectAccessToken, selectCurrentUser } from '@/features/auth/store/authSlice'



import { CALENDAR_READ_PERMISSION } from '../constants/calendarApiAccess'



/** True when the client may call GET /calendar. */

export function useShouldFetchCalendarEvents(): boolean {

  const token = useAppSelector(selectAccessToken)

  const user = useAppSelector(selectCurrentUser)

  return Boolean(token && user?.permissions.includes(CALENDAR_READ_PERMISSION))

}
