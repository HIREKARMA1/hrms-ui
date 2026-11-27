/**
 * Data fetching and derived rows for BalancesHrOverviewLiveSection.
 */

import { useEffect, useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/services/api/errors'

import type { LeaveTypeOption } from '../../api/leaveMappers'
import { useGetEmployeeLeavePolicyHrOverviewQuery } from '../../api/employeeLeavePoliciesApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import type { LeaveEmployee } from '../../types/employee'
import { enrichHrOverviewBalanceTableRows } from '../../utils/enrichHrOverviewBalanceTableRows'
import {
  hrOverviewRowsHaveBalanceValues,
  mapApiEmployeeLeavePolicyHrOverviewToTableRows,
  resolveHrOverviewBalanceTypeCodes,
} from '../../utils/mapApiEmployeeLeavePolicyHrOverview'
import { leaveTodayIso } from '../../utils/leaveToday'

export const HR_OVERVIEW_PAGE_SIZE = 50

export function useBalancesHrOverviewLive(
  search: string,
  onSearchChange: (value: string) => void,
  snapshotEmployees: LeaveEmployee[],
  orgLeaveTypes: LeaveTypeOption[],
) {
  const canFetch = useShouldFetchLeaveList()
  const defaultYear = Number(leaveTodayIso().slice(0, 4))
  const [year, setYear] = useState(defaultYear)
  const trimmedSearch = search.trim()
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [trimmedSearch, year])

  const { data, isError, error, isFetching, refetch } = useGetEmployeeLeavePolicyHrOverviewQuery(
    {
      page,
      limit: HR_OVERVIEW_PAGE_SIZE,
      year,
      search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
    },
    { skip: !canFetch },
  )

  const rows = useMemo(() => {
    if (!data || isError) return []
    const mapped = mapApiEmployeeLeavePolicyHrOverviewToTableRows(data)
    return enrichHrOverviewBalanceTableRows(mapped, snapshotEmployees)
  }, [data, isError, snapshotEmployees])

  const typeCodes = useMemo(() => resolveHrOverviewBalanceTypeCodes(rows, orgLeaveTypes), [rows, orgLeaveTypes])

  const leaveTypeLabelByCode = useMemo(() => {
    const map = new Map<string, string>()
    for (const type of orgLeaveTypes) {
      if (!type.isActive) continue
      const code = type.code.trim().toUpperCase()
      if (code) map.set(code, type.name)
    }
    return map
  }, [orgLeaveTypes])

  const showMissingBalancesNotice =
    !isFetching && !isError && rows.length > 0 && !hrOverviewRowsHaveBalanceValues(rows)

  const errorMessage =
    canFetch && isError
      ? getApiErrorMessage(error, 'Unable to load employee balances from the server.')
      : null

  const total = data?.total ?? rows.length
  const totalPages = data?.totalPages ?? (total > 0 ? Math.ceil(total / HR_OVERVIEW_PAGE_SIZE) : 1)
  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  function handleSearchChange(value: string) {
    setPage(1)
    onSearchChange(value)
  }

  const yearOptions = [defaultYear - 1, defaultYear, defaultYear + 1]

  return {
    canFetch,
    year,
    setYear,
    yearOptions,
    page,
    setPage,
    rows,
    typeCodes,
    leaveTypeLabelByCode,
    showMissingBalancesNotice,
    errorMessage,
    isFetching,
    refetch,
    total,
    totalPages,
    canGoPrev,
    canGoNext,
    handleSearchChange,
  }
}