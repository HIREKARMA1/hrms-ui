/**
 * Apply-for-leave sheet with live validation summary and approval chain preview.
 * Opened from My Leave primary action.
 */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { LEAVE_TYPE_LABELS } from '../../constants/leaveTypeCodes'
import type { LeaveEmployee } from '../../types/employee'
import type { LeaveSettings } from '../../types/leaveSettings'
import { getApprovalChain } from '../../utils/getApprovalChain'
import { validateLeaveRequest } from '../../utils/validateLeaveRequest'
import type { LedgerEntry } from '../../types/ledger'
import type { LeaveRequest } from '../../types/leaveRequest'

type ApplyLeaveSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: LeaveEmployee
  settings: LeaveSettings
  ledger: LedgerEntry[]
  existing: LeaveRequest[]
  employees: LeaveEmployee[]
  onSubmit: (input: {
    leaveTypeCode: string
    fromDate: string
    toDate: string
    reason: string
    attachmentName?: string
    convertExtraToLwp?: boolean
  }) => void
}

export function ApplyLeaveSheet({
  open,
  onOpenChange,
  employee,
  settings,
  ledger,
  existing,
  employees,
  onSubmit,
}: ApplyLeaveSheetProps) {
  const [leaveTypeCode, setLeaveTypeCode] = useState('CL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [convertLwp, setConvertLwp] = useState(false)
  const enabled = settings.leaveTypes.filter((item) => item.enabled)
  const byId = Object.fromEntries(employees.map((item) => [item.id, item]))
  const policy = settings.leaveTypes.find((item) => item.code === leaveTypeCode)
  const preview =
    fromDate && toDate && policy
      ? validateLeaveRequest(
          { employeeId: employee.id, leaveTypeCode, fromDate, toDate, reason, attachmentName, convertExtraToLwp: convertLwp },
          settings,
          employee,
          ledger,
          existing,
          employees,
        )
      : null
  const chain =
    policy && preview
      ? getApprovalChain(policy, employee, byId, preview.daysCounted)
      : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Apply for leave</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto py-4 text-sm">
          <div>
            <Label htmlFor="leave-type">Leave type</Label>
            <select
              id="leave-type"
              className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3"
              value={leaveTypeCode}
              onChange={(event) => setLeaveTypeCode(event.target.value)}
            >
              {enabled.map((item) => (
                <option key={item.code} value={item.code}>
                  {LEAVE_TYPE_LABELS[item.code as keyof typeof LEAVE_TYPE_LABELS] ?? item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="from-date">From</Label>
              <Input id="from-date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="to-date">To</Label>
              <Input id="to-date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="leave-reason">Reason</Label>
            <Input id="leave-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="leave-file">Attachment (name only)</Label>
            <Input
              id="leave-file"
              type="file"
              className="mt-1"
              onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? '')}
            />
          </div>
          {preview?.warnings.some((item) => item.includes('Convert the extra')) ? (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={convertLwp} onChange={(event) => setConvertLwp(event.target.checked)} />
              Convert extra days to Leave Without Pay
            </label>
          ) : null}
          {preview ? (
            <div className="rounded-xl bg-hrms-page p-3 text-xs">
              <p>Days counted: {preview.daysCounted}</p>
              {preview.errors.map((error) => (
                <p key={error} className="text-hrms-danger">
                  {error}
                </p>
              ))}
              {preview.warnings.map((warning) => (
                <p key={warning} className="text-hrms-warning">
                  {warning}
                </p>
              ))}
              <p className="mt-2 font-semibold">Approval chain</p>
              <p>{chain.map((step) => step.approverName).join(' → ') || 'HR'}</p>
            </div>
          ) : null}
        </div>
        <div className="sticky bottom-0 border-t border-hrms-border bg-white py-3">
          <Button
            type="button"
            disabled={!preview || preview.errors.length > 0 || !reason.trim()}
            onClick={() => {
              onSubmit({ leaveTypeCode, fromDate, toDate, reason, attachmentName, convertExtraToLwp: convertLwp })
              onOpenChange(false)
            }}
          >
            Submit request
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
