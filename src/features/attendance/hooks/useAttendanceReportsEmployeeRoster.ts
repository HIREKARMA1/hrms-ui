/**
 * Debounced GET /employees + search for the Attendance Reports roster.
 */
import { useEffect, useMemo, useState } from 'react'

import { getPageInfo } from '@/features/employees/api/employeeMappers'
import { useListEmployeesQuery, useSearchEmployeesQuery } from '@/features/employees/api/employeesApi'

import {
  ATTENDANCE_ROSTER_PAGE_SIZE,
  ATTENDANCE_ROSTER_SEARCH_DEBOUNCE_MS,
} from '../constants/attendanceReportsRoster'

export function useAttendanceReportsEmployeeRoster() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [skip, setSkip] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim())
      setSkip(0)
    }, ATTENDANCE_ROSTER_SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const listResult = useListEmployeesQuery(
    { skip, take: ATTENDANCE_ROSTER_PAGE_SIZE },
    { skip: Boolean(query) },
  )
  const searchResult = useSearchEmployeesQuery(
    { q: query, skip, take: ATTENDANCE_ROSTER_PAGE_SIZE },
    { skip: !query },
  )
  const active = query ? searchResult : listResult
  const page = active.data
  const rows = useMemo(() => page?.items ?? [], [page])
  const pageInfo = page ? getPageInfo(page, rows.length) : null

  const showPagination =
    Boolean(pageInfo && pageInfo.total > ATTENDANCE_ROSTER_PAGE_SIZE)

  return {
    search,
    setSearch,
    skip,
    setSkip,
    active,
    page,
    rows,
    pageInfo,
    showPagination,
    pageSize: ATTENDANCE_ROSTER_PAGE_SIZE,
  }
}