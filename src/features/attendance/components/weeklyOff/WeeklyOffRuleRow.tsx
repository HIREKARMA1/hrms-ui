/**
 * Single weekly-off rule row (weekday + optional nth occurrence).
 */
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  WEEKLY_OFF_WEEKDAYS,
  type WeeklyOffRule,
  type WeeklyOffWeekday,
} from '@/features/officeCalendar/types/api/weeklyOffs.types'

import { weeklyOffWeekdayTitle } from '../../utils/weeklyOffRuleLabels'

const OCCURRENCE_OPTIONS = [
  { value: 'every', label: 'Every week' },
  { value: '1', label: '1st of month' },
  { value: '2', label: '2nd of month' },
  { value: '3', label: '3rd of month' },
  { value: '4', label: '4th of month' },
  { value: '5', label: '5th of month' },
] as const

type WeeklyOffRuleRowProps = {
  index: number
  rule: WeeklyOffRule
  disabled?: boolean
  onChange: (rule: WeeklyOffRule) => void
  onRemove: () => void
}

function occurrenceValue(rule: WeeklyOffRule): string {
  if (rule.occurrence === undefined || rule.occurrence === null) return 'every'
  return String(rule.occurrence)
}

export function WeeklyOffRuleRow({
  index,
  rule,
  disabled,
  onChange,
  onRemove,
}: WeeklyOffRuleRowProps) {
  const occ = occurrenceValue(rule)

  return (
    <div className="grid gap-3 rounded-xl border border-border-soft bg-app-bg p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div className="space-y-2">
        <Label htmlFor={`weekly-off-weekday-${index}`}>Weekday</Label>
        <Select
          value={rule.weekday}
          disabled={disabled}
          onValueChange={(v) => onChange({ ...rule, weekday: v as WeeklyOffWeekday })}
        >
          <SelectTrigger id={`weekly-off-weekday-${index}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEEKLY_OFF_WEEKDAYS.map((day) => (
              <SelectItem key={day} value={day}>
                {weeklyOffWeekdayTitle(day)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`weekly-off-occurrence-${index}`}>Pattern</Label>
        <Select
          value={occ}
          disabled={disabled}
          onValueChange={(v) =>
            onChange({
              ...rule,
              occurrence: v === 'every' ? undefined : Number(v),
            })
          }
        >
          <SelectTrigger id={`weekly-off-occurrence-${index}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OCCURRENCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0 border-border-soft"
        disabled={disabled}
        onClick={onRemove}
        aria-label="Remove rule"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}