import { format, isValid, parse } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'

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
  const selected = parseIsoDate(value)
  const max = maxDate ? parseIsoDate(maxDate) : undefined
  const min = minDate ? parseIsoDate(minDate) : undefined

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
          <CalendarIcon className="mr-2 h-4 w-4 text-brand-500" />
          {selected ? format(selected, 'dd MMM yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          captionLayout="dropdown"
          startMonth={new Date(1950, 0)}
          endMonth={new Date(new Date().getFullYear() + 5, 11)}
          disabled={[
            ...(max ? [{ after: max }] : []),
            ...(min ? [{ before: min }] : []),
          ]}
          onSelect={(date) => {
            onChange(date ? toIsoDate(date) : '')
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
