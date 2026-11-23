/**

 * Schedule tab live data from monthly + daily view APIs (holidays stay local).

 */

import { useMemo } from 'react'



import { useGetWeeklyOffDatesQuery } from '../api/weeklyOffsApi'

import {

  useGetCalendarViewDailyQuery,

  useGetCalendarViewMonthlyQuery,

} from '../api/calendarViewsApi'

import type { OfficeCalendarScheduleCategory } from '../constants/officeCalendarScheduleCategoryColors'

import { useShouldFetchWeeklyOffPolicy } from './useShouldFetchWeeklyOffPolicy'

import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'

import {

  buildScheduleItems,

  itemsForDate,

  monthPrefix,

  scheduleCategoryCounts,

  type OfficeCalendarScheduleItem,

} from '../utils/officeCalendarScheduleItems'

import {

  dailyViewToAgendaItems,

  monthlyViewToScheduleItems,

  officeEventsFromMonthlyView,

  weeklyOffScheduleItem,

} from '../utils/mapCalendarViewToSchedule'

import { mergeWeeklyOffDatesIntoSchedule } from '../utils/mergeWeeklyOffDatesIntoSchedule'



type LiveViewsInput = {

  enabled: boolean

  month: Date

  selectedDateKey: string

  holidays: OfficeHoliday[]

  fallbackEvents: OfficeCalendarEvent[]

  isVisible: (category: OfficeCalendarScheduleCategory) => boolean

}



function isWeeklyOffDate(

  dateKey: string,

  fromDailyView: boolean | undefined,

  offDates: ReadonlySet<string>,

): boolean {

  return fromDailyView === true || offDates.has(dateKey)

}



export function useOfficeCalendarScheduleLiveViews(input: LiveViewsInput) {

  const year = input.month.getFullYear()

  const monthNum = input.month.getMonth() + 1

  const canLoadWeeklyOffDates = useShouldFetchWeeklyOffPolicy()



  const {

    data: monthlyData,

    isFetching: monthlyFetching,

    isError: monthlyError,

  } = useGetCalendarViewMonthlyQuery(

    { year, month: monthNum },

    { skip: !input.enabled },

  )



  const {

    data: dailyData,

    isFetching: dailyFetching,

    isError: dailyError,

  } = useGetCalendarViewDailyQuery(

    { date: input.selectedDateKey },

    { skip: !input.enabled },

  )



  const { data: weeklyOffDatesData, isFetching: weeklyOffDatesFetching } =

    useGetWeeklyOffDatesQuery(

      { year, month: monthNum },

      { skip: !input.enabled || !canLoadWeeklyOffDates },

    )



  const weeklyOffDateSet = useMemo(

    () => new Set(weeklyOffDatesData?.dates ?? []),

    [weeklyOffDatesData?.dates],

  )



  const gridEvents = useMemo(() => {

    if (!input.enabled || !monthlyData?.days.length) return input.fallbackEvents

    return officeEventsFromMonthlyView(monthlyData)

  }, [input.enabled, input.fallbackEvents, monthlyData])



  const demoItems = useMemo(

    () => buildScheduleItems(input.holidays, gridEvents),

    [gridEvents, input.holidays],

  )



  const allItems = useMemo((): OfficeCalendarScheduleItem[] => {

    let rows: OfficeCalendarScheduleItem[]

    if (input.enabled && monthlyData?.days.length) {

      rows = monthlyViewToScheduleItems(input.holidays, monthlyData, input.month)

    } else {

      rows = demoItems

    }

    if (input.enabled && weeklyOffDatesData?.dates.length) {

      rows = mergeWeeklyOffDatesIntoSchedule(

        rows,

        weeklyOffDatesData.dates,

        monthPrefix(input.month),

      )

    }

    return rows

  }, [demoItems, input.enabled, input.holidays, input.month, monthlyData, weeklyOffDatesData?.dates])



  const counts = useMemo(

    () => scheduleCategoryCounts(input.month, allItems),

    [allItems, input.month],

  )



  const dayItems = useMemo((): OfficeCalendarScheduleItem[] => {

    const holidayRows = demoItems.filter(

      (row) => row.dateKey === input.selectedDateKey && row.isCompanyHoliday && input.isVisible('holiday'),

    )

    if (input.enabled && dailyData && dailyData.date === input.selectedDateKey) {

      const eventRows = dailyViewToAgendaItems(dailyData, input.selectedDateKey, input.isVisible)

      const weeklyOffRows =

        isWeeklyOffDate(input.selectedDateKey, dailyData.isWeeklyOff, weeklyOffDateSet) &&

        input.isVisible('weeklyOff')

          ? [weeklyOffScheduleItem(input.selectedDateKey)]

          : []

      return [...holidayRows, ...weeklyOffRows, ...eventRows]

    }

    return itemsForDate(allItems, input.selectedDateKey, input.isVisible)

  }, [

    allItems,

    dailyData,

    demoItems,

    input.enabled,

    input.isVisible,

    input.selectedDateKey,

    weeklyOffDateSet,

  ])



  return {

    gridEvents,

    allItems,

    counts,

    dayItems,

    truncated: monthlyData?.truncated === true,

    viewsFetching: monthlyFetching || dailyFetching || weeklyOffDatesFetching,

    viewsError: input.enabled && (monthlyError || dailyError),

  }

}
