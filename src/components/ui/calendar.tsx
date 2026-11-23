import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { DayPicker } from 'react-day-picker'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import 'react-day-picker/style.css'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row gap-4',
        month: 'space-y-3',
        month_caption: 'flex justify-center items-center h-9 relative px-8',
        caption_label: 'text-sm font-semibold text-navy',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between px-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          'h-8 w-8 bg-transparent p-0 opacity-80 hover:opacity-100',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          'h-8 w-8 bg-transparent p-0 opacity-80 hover:opacity-100',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-text-secondary w-9 font-normal text-[0.75rem]',
        week: 'flex w-full mt-1',
        day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        selected:
          'bg-brand-500 text-white hover:bg-brand-600 hover:text-white focus:bg-brand-500 focus:text-white rounded-lg',
        today: 'bg-lavender text-navy rounded-lg',
        outside: 'text-text-secondary opacity-50',
        disabled: 'text-text-secondary opacity-40',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
