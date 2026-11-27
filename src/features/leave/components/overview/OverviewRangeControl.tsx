/**
 * Segmented chart range control for Overview trend and type charts.
 */

import type { OverviewChartRange } from '../../utils/overviewRange'
import { LeaveSegmentedControl } from '../shared/LeaveSegmentedControl'

const OPTIONS = [
  { value: 'last_3_months' as const, label: 'Last 3 months' },
  { value: 'last_6_months' as const, label: 'Last 6 months' },
  { value: 'this_year' as const, label: 'This year' },
]

type OverviewRangeControlProps = {
  value: OverviewChartRange
  onChange: (value: OverviewChartRange) => void
}

export function OverviewRangeControl({ value, onChange }: OverviewRangeControlProps) {
  return (
    <LeaveSegmentedControl
      options={OPTIONS}
      value={value}
      onChange={onChange}
      ariaLabel="Leave chart date range"
      appearance="overview"
    />
  )
}
