import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { CorrectionRequest } from '../types/attendance'
import { ApprovalStatusBadge } from './AttendanceStatusBadge'

type CorrectionRequestDialogProps = {
  open: boolean
  request: CorrectionRequest | null
  onOpenChange: (open: boolean) => void
  onApprove: (request: CorrectionRequest) => void
  onReject: (request: CorrectionRequest) => void
  canApprove?: boolean
}

export function CorrectionRequestDialog({
  open,
  request,
  onOpenChange,
  onApprove,
  onReject,
  canApprove = true,
}: CorrectionRequestDialogProps) {
  if (!request) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Correction Request Details</DialogTitle>
          <DialogDescription>
            Review employee attendance correction before taking action.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-xl border border-border-soft bg-muted-bg/50 p-4 text-sm sm:grid-cols-2">
          <Detail label="Employee" value={request.employeeName} />
          <Detail label="Employee ID" value={request.employeeId} />
          <Detail label="Department" value={request.department} />
          <Detail label="Attendance Date" value={request.date} />
          <Detail label="Original Check-in" value={request.originalCheckIn} />
          <Detail label="Requested Check-in" value={request.requestedCheckIn} />
          <Detail label="Original Check-out" value={request.originalCheckOut} />
          <Detail
            label="Requested Check-out"
            value={request.requestedCheckOut}
          />
          <Detail label="Request Date" value={request.requestDate} />
          <div>
            <p className="text-xs font-medium text-text-secondary">Status</p>
            <div className="mt-1">
              <ApprovalStatusBadge status={request.status} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-text-secondary">Reason</p>
            <p className="mt-1 font-medium text-navy">{request.reason}</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {request.status === 'Pending' && canApprove ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="border-rose-200 text-[#EF4444] hover:bg-rose-50"
                onClick={() => onReject(request)}
              >
                Reject
              </Button>
              <Button type="button" onClick={() => onApprove(request)}>
                Approve
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-1 font-medium text-navy">{value}</p>
    </div>
  )
}
