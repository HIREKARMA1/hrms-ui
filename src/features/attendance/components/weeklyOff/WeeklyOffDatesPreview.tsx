/**
 * Lists generated weekly-off dates for a selected year/month.
 */
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetWeeklyOffDatesQuery } from '@/features/officeCalendar/api/weeklyOffsApi'
import { useShouldFetchWeeklyOffPolicy } from '@/features/officeCalendar/hooks/useShouldFetchWeeklyOffPolicy'

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
] as const

function yearOptions(): number[] {
  const current = new Date().getFullYear()
  return [current - 1, current, current + 1]
}

export function WeeklyOffDatesPreview() {
  const canFetch = useShouldFetchWeeklyOffPolicy()
  const now = useMemo(() => new Date(), [])
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(String(now.getMonth() + 1))

  const { data, isFetching, isError } = useGetWeeklyOffDatesQuery(
    { year, month: Number(month) },
    { skip: !canFetch },
  )

  const years = yearOptions()

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="text-navy">Generated off dates</CardTitle>
        <CardDescription>
          From GET /calendar/weekly-offs/dates for the selected month (Asia/Kolkata).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="weekly-off-preview-year">Year</Label>
            <Select
              value={String(year)}
              disabled={!canFetch}
              onValueChange={(v) => setYear(Number(v))}
            >
              <SelectTrigger id="weekly-off-preview-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weekly-off-preview-month">Month</Label>
            <Select value={month} disabled={!canFetch} onValueChange={setMonth}>
              <SelectTrigger id="weekly-off-preview-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {!canFetch ? (
          <p className="text-sm text-text-secondary">Dates preview requires calendar:read.</p>
        ) : isError ? (
          <p className="text-sm text-hrms-danger">Could not load off dates for this month.</p>
        ) : isFetching && !data ? (
          <p className="text-sm text-text-secondary">Loading dates…</p>
        ) : (
          <>
            <p className="text-sm text-text-secondary">
              {data?.dates.length ?? 0} off day{(data?.dates.length ?? 0) === 1 ? '' : 's'} in this
              month
            </p>
            <div className="flex flex-wrap gap-2">
              {(data?.dates ?? []).map((iso) => (
                <Badge key={iso} variant="secondary" className="bg-lavender text-brand-600">
                  {iso}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}