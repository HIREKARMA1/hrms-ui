import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { todayIsoDate } from '../utils/dashboardDateRange'

type Props = {
  value: string
  onChange: (isoDate: string) => void
}

export function LateArrivalsDateFilter({ value, onChange }: Props) {
  const today = todayIsoDate()
  const viewingToday = value === today

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Input
        type="date"
        className="w-full sm:w-[170px]"
        max={today}
        value={value}
        onChange={(event) => {
          const next = event.target.value
          if (next) onChange(next)
        }}
        aria-label="Attendance date for late arrivals"
      />
      {!viewingToday ? (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(today)}>
          Today
        </Button>
      ) : null}
    </div>
  )
}