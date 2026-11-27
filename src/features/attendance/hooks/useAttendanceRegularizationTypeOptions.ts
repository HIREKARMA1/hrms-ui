import { useMemo } from 'react'

import {
  useGetAttendanceReportByEmployeeIdForDateQuery,
  useGetMyAttendanceReportForDateQuery,
} from '../api/attendanceReportApi'
import { buildAttendanceRegularizationTypeOptions } from '../utils/buildAttendanceRegularizationTypeOptions'

type UseAttendanceRegularizationTypeOptionsArgs = {
  employeeId: string
  attendanceDate: string
  isEmployeeWorkspace: boolean
}

export function useAttendanceRegularizationTypeOptions({
  employeeId,
  attendanceDate,
  isEmployeeWorkspace,
}: UseAttendanceRegularizationTypeOptionsArgs) {
  const canFetchReport = Boolean(attendanceDate) && (isEmployeeWorkspace || Boolean(employeeId.trim()))

  const byEmployee = useGetAttendanceReportByEmployeeIdForDateQuery(
    { employeeId: employeeId.trim(), date: attendanceDate },
    { skip: isEmployeeWorkspace || !canFetchReport },
  )

  const byMe = useGetMyAttendanceReportForDateQuery(
    { date: attendanceDate },
    { skip: !isEmployeeWorkspace || !attendanceDate },
  )

  const report = isEmployeeWorkspace ? byMe.data : byEmployee.data
  const isFetchingReport = isEmployeeWorkspace ? byMe.isFetching : byEmployee.isFetching
  const reportLoaded = canFetchReport && !isFetchingReport

  const { submittable } = useMemo(
    () =>
      buildAttendanceRegularizationTypeOptions({
        report,
        attendanceDate,
        reportLoaded,
      }),
    [attendanceDate, report, reportLoaded],
  )

  return {
    options: submittable,
    isFetchingReport: canFetchReport && isFetchingReport,
    canFetchReport,
    reportLoaded,
  }
}
