/**
 * Legend row explaining holiday, weekly off, and leave chip colors on CalendarTab.
 */

import { LeaveTypeChip } from '../LeaveTypeChip'

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-hrms-text-secondary">
      <span className="font-medium text-hrms-navy">Legend</span>
      <span className="rounded-md bg-hrms-info/10 px-2 py-1 text-hrms-navy">Holiday</span>
      <span className="rounded-md bg-hrms-muted-bg px-2 py-1">Weekly off</span>
      <LeaveTypeChip code="CL" abbreviated />
      <LeaveTypeChip code="SL" abbreviated />
      <LeaveTypeChip code="EL" abbreviated />
    </div>
  )
}
