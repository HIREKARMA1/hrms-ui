import { useAppSelector } from '@/app/store/hooks'
import {
  selectAccessToken,
  selectCurrentUser,
} from '@/features/auth/store/authSlice'

import { DASHBOARD_SUMMARY_PERMISSION } from '../constants/dashboardApiAccess'

/** True when the client may call `GET /dashboard/summary`. */
export function useShouldFetchDashboardSummary(): boolean {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  return Boolean(
    token && user?.permissions.includes(DASHBOARD_SUMMARY_PERMISSION),
  )
}