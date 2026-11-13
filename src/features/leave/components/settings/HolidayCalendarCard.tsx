/**
 * Editable holiday table for the leave year on Leave Settings tab.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { LeaveSettings } from '../../types/leaveSettings'
import { formatDate } from '../../utils/formatDate'

type HolidayCalendarCardProps = {
  draft: LeaveSettings
  onChange: (next: LeaveSettings) => void
}

export function HolidayCalendarCard({ draft }: HolidayCalendarCardProps) {
  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle className="text-base">Holiday calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-xs text-hrms-text-muted">Sample holidays, edit for your company.</p>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-hrms-text-secondary">
              <th className="pb-2">Date</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {draft.holidays.map((holiday) => (
              <tr key={holiday.id} className="border-t border-hrms-border/60">
                <td className="py-2">{formatDate(holiday.date)}</td>
                <td className="py-2">{holiday.name}</td>
                <td className="py-2">{holiday.holidayType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
