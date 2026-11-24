/**
 * Schedule tab notice when monthly view is truncated or view APIs fail.
 */
import { CALENDAR_INFO_BANNER } from '../shared/officeCalendarUi'

type OfficeCalendarScheduleViewBannerProps = {
  truncated?: boolean
  viewsError?: boolean
  viewsFetching?: boolean
}

export function OfficeCalendarScheduleViewBanner({
  truncated,
  viewsError,
  viewsFetching,
}: OfficeCalendarScheduleViewBannerProps) {
  if (!truncated && !viewsError && !viewsFetching) return null

  return (
    <p className={CALENDAR_INFO_BANNER} aria-live="polite">
      {viewsFetching ? 'Loading calendar views…' : null}
      {!viewsFetching && truncated ? (
        <>
          Month list was capped by the server (2000 events). Some events may be hidden on the grid.
        </>
      ) : null}
      {!viewsFetching && viewsError ? (
        <>
          Monthly/daily view failed to load; showing list data for this screen. Check network or retry
          reload.
        </>
      ) : null}
    </p>
  )
}