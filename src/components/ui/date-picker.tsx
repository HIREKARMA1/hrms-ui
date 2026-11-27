import { format, isValid, parse } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  placeholder?: string
  /** When set, dates after this (YYYY-MM-DD) cannot be selected. */
  maxDate?: string
  /** When set, dates before this (YYYY-MM-DD) cannot be selected. */
  minDate?: string
  id?: string
}

function parseIsoDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = parse(value, 'yyyy-MM-dd', new Date())
  return isValid(date) ? date : undefined
}

function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Shadcn-style date picker that stores values as YYYY-MM-DD for the API. */
export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'Pick a date',
  maxDate,
  minDate,
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseIsoDate(value), [value])
  const max = useMemo(() => (maxDate ? parseIsoDate(maxDate) : undefined), [maxDate])
  const min = useMemo(() => (minDate ? parseIsoDate(minDate) : undefined), [minDate])
  const startMonth = useMemo(() => min ?? new Date(1950, 0), [min])
  const endMonth = useMemo(
    () => max ?? new Date(new Date().getFullYear() + 5, 11),
    [max],
  )
  const [month, setMonth] = useState<Date>(() => parseIsoDate(value) ?? new Date())

  useEffect(() => {
    if (!value) return
    const next = parseIsoDate(value)
    if (!next) return
    setMonth((prev) => (toIsoDate(prev) === value ? prev : next))
  }, [value])

  const disabledDays = useMemo(
    () => [...(max ? [{ after: max }] : []), ...(min ? [{ before: min }] : [])],
    [max, min],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-11 w-full justify-start rounded-xl border-border-soft bg-white px-3 text-left font-normal',
            !selected && 'text-text-secondary',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-brand-500" />
          {selected ? format(selected, 'dd MMM yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabledDays}
          onSelect={(date) => {
            onChange(date ? toIsoDate(date) : '')
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
