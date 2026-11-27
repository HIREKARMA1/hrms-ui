import { useEffect, useMemo, useState } from 'react'

import { useAppDispatch } from '@/app/store/hooks'
import { employeesApi } from '@/features/employees/api/employeesApi'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import type { AttendanceRegularizationRecord } from '../types/api/attendanceRegularization.types'

export type RegularizationEmployeeLookup = {
  employeeName?: string
  employeeCode?: string
}

export function useRegularizationEmployeeLookup(
  items: Pick<AttendanceRegularizationRecord, 'employeeId' | 'employeeName' | 'employeeCode'>[],
) {
  const dispatch = useAppDispatch()
  const { canAccess } = useOptionalFeatureAccess()
  const canReadEmployees = canAccess('employee.directory')

  const idsToFetch = useMemo(() => {
    if (!canReadEmployees) return []
    const need = new Set<string>()
    for (const item of items) {
      const id = item.employeeId?.trim()
      if (!id) continue
      if (item.employeeName?.trim() && item.employeeCode?.trim()) continue
      need.add(id)
    }
    return [...need]
  }, [items, canReadEmployees])

  const idsKey = idsToFetch.join('|')

  const [lookup, setLookup] = useState<Record<string, RegularizationEmployeeLookup>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (idsToFetch.length === 0) {
      setLookup({})
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void (async () => {
      const pairs = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const record = await dispatch(
              employeesApi.endpoints.getEmployee.initiate(id, { subscribe: false }),
            ).unwrap()
            const name = [record.profile.firstName, record.profile.lastName]
              .filter(Boolean)
              .join(' ')
              .trim()
            return [
              id,
              {
                employeeName: name || undefined,
                employeeCode: record.profile.employeeCode?.trim() || undefined,
              },
            ] as const
          } catch {
            return [id, {}] as const
          }
        }),
      )
      if (cancelled) return
      setLookup(Object.fromEntries(pairs))
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [dispatch, idsKey, idsToFetch])

  return { lookup, isLoading, canReadEmployees }
}

export function mergeRegularizationEmployeeLookup(
  record: AttendanceRegularizationRecord,
  lookup: Record<string, RegularizationEmployeeLookup>,
): AttendanceRegularizationRecord {
  const id = record.employeeId?.trim()
  if (!id) return record
  const extra = lookup[id]
  if (!extra) return record
  return {
    ...record,
    employeeName: record.employeeName?.trim() || extra.employeeName,
    employeeCode: record.employeeCode?.trim() || extra.employeeCode,
  }
}