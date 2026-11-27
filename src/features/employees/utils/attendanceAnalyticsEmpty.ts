/**
 * When to treat attendance analytics as having nothing to chart.
 */

type SeriesPoint = {
  present: number
  absent: number
  onLeave: number
  late: number
}

export function attendanceAnalyticsHasChartData(
  chartData: SeriesPoint[],
  apiEmpty?: boolean,
): boolean {
  if (apiEmpty && chartData.length === 0) return false
  if (chartData.length === 0) return false
  return chartData.some(
    (point) => point.present > 0 || point.absent > 0 || point.onLeave > 0 || point.late > 0,
  )
}