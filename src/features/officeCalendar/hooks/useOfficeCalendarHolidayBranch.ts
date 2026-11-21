/**
 * Holidays list + save/delete for Office Calendar provider (API or demo).
 */
import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react'

import {
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
  useGetHolidaysQuery,
  useUpdateHolidayMutation,
} from '@/features/leave/api/holidaysApi'
import { mapApiHolidaysListToOfficeHolidays } from '@/features/leave/utils/mapApiHolidayToOfficeHoliday'
import { mapOfficeHolidayInputToCreateRequest } from '@/features/leave/utils/mapOfficeHolidayInputToCreateRequest'

import {
  deleteOfficeHoliday,
  upsertOfficeHoliday,
} from '../services/officeCalendarService'
import type { OfficeHoliday, OfficeHolidayInput } from '../types/officeCalendar'

type DemoHolidaySlice = {
  demoHolidays: OfficeHoliday[]
  setDemoHolidays: Dispatch<SetStateAction<OfficeHoliday[]>>
}

export function useOfficeCalendarHolidayBranch(
  shouldFetchHolidays: boolean,
  demo: DemoHolidaySlice,
) {
  const [holidayYear, setHolidayYear] = useState(() => new Date().getFullYear())
  const [createHoliday] = useCreateHolidayMutation()
  const [updateHoliday] = useUpdateHolidayMutation()
  const [deleteHoliday] = useDeleteHolidayMutation()

  const {
    data: holidaysList,
    isLoading: holidaysLoading,
    isFetching: holidaysFetching,
    isError: holidaysIsError,
    error: holidaysError,
    refetch: refetchHolidays,
  } = useGetHolidaysQuery({ year: holidayYear }, { skip: !shouldFetchHolidays })

  const holidaysSource = shouldFetchHolidays ? 'api' : 'demo'

  const holidays = useMemo(() => {
    if (shouldFetchHolidays) {
      return mapApiHolidaysListToOfficeHolidays(holidaysList?.items ?? [])
    }
    return demo.demoHolidays
  }, [demo.demoHolidays, holidaysList?.items, shouldFetchHolidays])

  const saveHoliday = useCallback(
    async (input: OfficeHolidayInput, id?: string) => {
      if (shouldFetchHolidays) {
        const body = mapOfficeHolidayInputToCreateRequest(input)
        const saved = id ? await updateHoliday({ id, body }).unwrap() : await createHoliday(body).unwrap()
        const savedYear = Number(saved.date.slice(0, 4))
        if (savedYear && savedYear !== holidayYear) setHolidayYear(savedYear)
        return saved
      }
      const saved = await upsertOfficeHoliday(input, id)
      demo.setDemoHolidays((current) => {
        if (id) return current.map((item) => (item.id === id ? saved : item))
        return [...current, saved]
      })
      return saved
    },
    [createHoliday, demo, holidayYear, shouldFetchHolidays, updateHoliday],
  )

  const removeHoliday = useCallback(
    async (id: string) => {
      if (shouldFetchHolidays) {
        await deleteHoliday({ id, listYear: holidayYear }).unwrap()
        return
      }
      await deleteOfficeHoliday(id)
      demo.setDemoHolidays((current) => current.filter((item) => item.id !== id))
    },
    [deleteHoliday, holidayYear, shouldFetchHolidays, demo],
  )

  return {
    holidayYear,
    setHolidayYear,
    holidays,
    holidaysSource,
    holidaysFetching,
    holidaysLoading,
    holidaysIsError,
    holidaysError,
    refetchHolidays,
    saveHoliday,
    removeHoliday,
  }
}