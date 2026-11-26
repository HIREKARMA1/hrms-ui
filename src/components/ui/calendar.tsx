import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { DayPicker, type DropdownProps } from 'react-day-picker'

import { buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarDropdown({ value, onChange, options, 'aria-label': ariaLabel }: DropdownProps) {
  const selected = options?.find((option) => String(option.value) === String(value))

  return (
    <Select
      value={value != null ? String(value) : undefined}
      onValueChange={(next) => {
        if (!onChange) return
        const event = {
          target: { value: next },
        } as React.ChangeEvent<HTMLSelectElement>
        onChange(event)
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-8 w-auto min-w-[5.5rem] gap-1 rounded-lg border-border-soft bg-white px-2 text-xs font-medium text-navy"
      >
        <SelectValue placeholder={selected?.label ?? ariaLabel}>
          {selected?.label ?? String(value ?? '')}
        </SelectValue>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {(options ?? []).map((option) => (
          <SelectItem
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      navLayout="around"
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col gap-3',
        month: 'relative space-y-3',
        month_caption: 'relative flex items-center justify-center px-10',
        caption_label: 'text-sm font-semibold text-navy',
        dropdowns: 'flex items-center justify-center gap-2',
        dropdown_root: 'relative',
        months_dropdown: 'relative',
        years_dropdown: 'relative',
        nav: 'pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous: cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          'pointer-events-auto z-10 h-8 w-8 rounded-lg border-border-soft bg-white p-0 text-navy shadow-none',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          'pointer-events-auto z-10 h-8 w-8 rounded-lg border-border-soft bg-white p-0 text-navy shadow-none',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-text-secondary w-9 text-center text-[0.75rem] font-medium',
        week: 'mt-1 flex w-full',
        day: 'relative h-9 w-9 p-0 text-center text-sm',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 rounded-lg p-0 font-normal text-navy hover:bg-lavender hover:text-navy',
          'aria-selected:bg-brand-500 aria-selected:text-white aria-selected:hover:bg-brand-600 aria-selected:hover:text-white',
        ),
        selected: 'rounded-lg bg-brand-500 text-white',
        today: 'rounded-lg bg-lavender text-navy',
        outside: 'text-text-secondary opacity-40',
        disabled: 'text-text-secondary opacity-30',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon =
            orientation === 'left'
              ? ChevronLeft
              : orientation === 'right'
                ? ChevronRight
                : ChevronDown
          return <Icon className={cn('h-4 w-4', chevronClassName)} {...chevronProps} />
        },
        Dropdown: CalendarDropdown,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
