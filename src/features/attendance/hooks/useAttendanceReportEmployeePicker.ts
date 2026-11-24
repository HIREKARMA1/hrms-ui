/**
 * Debounced GET /employees list for Attendance Reports employee picker.
 */
import { useEffect, useMemo, useState } from 'react'

import { useListEmployeesQuery, useSearchEmployeesQuery } from '@/features/employees/api/employeesApi'

import {
  ATTENDANCE_ROSTER_PAGE_SIZE,
  ATTENDANCE_ROSTER_SEARCH_DEBOUNCE_MS,
} from '../constants/attendanceReportsRoster'

export function useAttendanceReportEmployeePicker() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), ATTENDANCE_ROSTER_SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const listResult = useListEmployeesQuery(
    { skip: 0, take: ATTENDANCE_ROSTER_PAGE_SIZE },
    { skip: Boolean(query) },
  )
  const searchResult = useSearchEmployeesQuery(
    { q: query, skip: 0, take: ATTENDANCE_ROSTER_PAGE_SIZE },
    { skip: !query },
  )
  const active = query ? searchResult : listResult
  const rows = useMemo(() => active.data?.items ?? [], [active.data?.items])

  return { search, setSearch, rows, isFetching: active.isFetching, isError: active.isError }
}