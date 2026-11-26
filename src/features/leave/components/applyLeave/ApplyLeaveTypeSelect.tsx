import { useMemo } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { formatLeaveTypeBalanceOptionLabel } from '../../utils/formatLeaveBalanceDisplay'
import type { ApplyLeaveTypeOption } from '../../utils/applyLeaveTypeOptionsFromBalance'
import { LEAVE_DIALOG_SELECT } from '../shared/leaveUi'

type Row = ApplyLeaveTypeOption | { code: string; label: string; available: number | null }

type ApplyLeaveTypeSelectProps = {
  id?: string
  value: string
  options: ApplyLeaveTypeOption[]
  loading?: boolean
  disabled?: boolean
  onChange: (code: string) => void
  triggerClassName?: string
  demoOptions?: { code: string; label: string; available: number | null }[]
}

function isBalanceRow(item: Row): item is ApplyLeaveTypeOption {
  return 'used' in item && typeof item.used === 'number'
}

function triggerLabelFor(row: Row): string {
  const available = row.available ?? 0
  if (isBalanceRow(row)) {
    return formatLeaveTypeBalanceOptionLabel(row.label, available)
  }
  return available === null ? row.label : `${row.label} · ${available} day${available === 1 ? '' : 's'} left`
}

export function ApplyLeaveTypeSelect({
  id,
  value,
  options,
  loading,
  disabled,
  onChange,
  triggerClassName,
  demoOptions,
}: ApplyLeaveTypeSelectProps) {
  const rows: Row[] = demoOptions ?? options
  const empty = rows.length === 0
  const placeholder = loading ? 'Loading leave balance…' : empty ? 'No leave types on balance' : 'Select leave type'

  const selectedRow = useMemo(() => rows.find((item) => item.code === value), [rows, value])
  const triggerText = selectedRow ? triggerLabelFor(selectedRow) : null

  return (
    <Select value={value || undefined} disabled={disabled || empty} onValueChange={onChange}>
      <SelectTrigger id={id} className={cn(LEAVE_DIALOG_SELECT, 'h-10', triggerClassName)}>
        <SelectValue placeholder={placeholder}>{triggerText ?? undefined}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {rows.map((item) => {
          const available = item.available ?? 0
          const title = isBalanceRow(item)
            ? formatLeaveTypeBalanceOptionLabel(item.label, available)
            : `${item.label}${item.available === null ? '' : ` — ${available} day${available === 1 ? '' : 's'} available`}`
          const subtitle = isBalanceRow(item) ? `Used ${item.used} · Pending ${item.pending}` : undefined
          return (
            <SelectItem key={item.code} value={item.code} textValue={title} className="py-2.5">
              <div className="flex flex-col gap-0.5 pr-6 text-left">
                <span className="text-sm font-medium text-hrms-navy">{title}</span>
                {subtitle ? <span className="text-xs text-hrms-text-muted">{subtitle}</span> : null}
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}