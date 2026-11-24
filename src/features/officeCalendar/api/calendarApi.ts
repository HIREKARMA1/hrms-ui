/**
 * Calendar API hooks barrel — events + read endpoints (re-export for imports).
 */
export {
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useGetCalendarEventByIdQuery,
  useGetCalendarEventsQuery,
  useLazyGetCalendarEventsQuery,
  useUpdateCalendarEventMutation,
} from './calendarEventsApi'

export {
  useGetCalendarTodayQuery,
  useGetCalendarUpcomingQuery,
  useGetCalendarWidgetUpcomingQuery,
  useSearchCalendarEventsQuery,
} from './calendarReadsApi'

export { useGetCalendarViewDailyQuery, useGetCalendarViewMonthlyQuery } from './calendarViewsApi'

export { useExportCalendarMutation } from './calendarExportApi'

export {
  useConfigureWeeklyOffMutation,
  useGetWeeklyOffDatesQuery,
  useGetWeeklyOffPolicyQuery,
  useLazyGetWeeklyOffDatesQuery,
  useLazyGetWeeklyOffPolicyQuery,
} from './weeklyOffsApi'