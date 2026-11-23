/**
 * Compact leave type label chip with per-type tint from leaveTypeChips tokens.
 * Used in request tables and calendar day cells.
 */

import { cn } from '@/lib/utils'

import { leaveTypeChipClasses } from '../constants/leaveTypeChips'
import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../constants/leaveTypeCodes'

type LeaveTypeChipProps = {
  code: string
  abbreviated?: boolean
  className?: string
}

export function LeaveTypeChip({ code, abbreviated, className }: LeaveTypeChipProps) {
  const typed = code as LeaveTypeCode
  const tone = leaveTypeChipClasses[typed] ?? leaveTypeChipClasses.LWP
  const label = abbreviated ? code : (LEAVE_TYPE_LABELS[typed] ?? code)
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-md px-2 py-0.5 text-xs font-medium',
        tone,
        className,
      )}
      title={LEAVE_TYPE_LABELS[typed] ?? code}
    >
      {label}
    </span>
  )
}
