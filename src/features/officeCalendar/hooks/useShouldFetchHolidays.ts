import { useShouldFetchLeaveList } from '@/features/leave/hooks/useShouldFetchLeaveList'

/** True when the client may call GET /holidays (same permission as leave list today). */
export function useShouldFetchHolidays(): boolean {
  return useShouldFetchLeaveList()
}