import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { LEAVE_FILTER_SELECT, LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'
import { AccrualRunResultStrip, type AccrualRunFeedback } from './AccrualRunResultStrip'

export function AccrualRunCard({
  title,
  button,
  onRun,
  disabled,
  outline,
  runFeedback,
  children,
}: {
  title: string
  button: string
  onRun: () => void
  disabled?: boolean
  outline?: boolean
  runFeedback?: AccrualRunFeedback | null
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader className="border-b border-hrms-border pb-3">
        <CardTitle className="text-base font-semibold text-hrms-navy">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5 text-sm">
        <label className="block">{children}</label>
        <Button
          type="button"
          variant={outline ? 'outline' : 'default'}
          className={outline ? LEAVE_SECONDARY_BUTTON : undefined}
          disabled={disabled}
          onClick={onRun}
        >
          {button}
        </Button>
        {runFeedback ? <AccrualRunResultStrip feedback={runFeedback} /> : null}
      </CardContent>
    </Card>
  )
}

export function AccrualYearSelect({
  value,
  years,
  onChange,
  className,
}: {
  value: number
  years: number[]
  onChange: (year: number) => void
  className?: string
}) {
  return (
    <select
      className={cn('mt-1', LEAVE_FILTER_SELECT, 'w-full', className)}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  )
}