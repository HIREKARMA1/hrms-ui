import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ToastBanner, useToast } from '@/hooks/useToast'

import { CorrectionRequestDialog } from '../components/CorrectionRequestDialog'
import { ApprovalStatusBadge } from '../components/AttendanceStatusBadge'
import { correctionRequests } from '../mocks/attendanceMocks'
import type { ApprovalStatus, CorrectionRequest } from '../types/attendance'

type PendingAction = {
  type: 'approve' | 'reject'
  request: CorrectionRequest
}

export function AttendanceCorrectionsPage() {
  const { message, toast } = useToast()
  const [requests, setRequests] = useState<CorrectionRequest[]>(() => [
    ...correctionRequests,
  ])
  const [viewRequest, setViewRequest] = useState<CorrectionRequest | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const confirmCopy = useMemo(() => {
    if (!pendingAction) return { title: '', description: '' }
    const { type, request } = pendingAction
    const verb = type === 'approve' ? 'approve' : 'reject'
    return {
      title: type === 'approve' ? 'Approve correction request?' : 'Reject correction request?',
      description: `You are about to ${verb} the correction request from ${request.employeeName} (${request.employeeId}) for ${request.date}. This action is a UI preview only.`,
    }
  }, [pendingAction])

  const openView = (request: CorrectionRequest) => {
    setViewRequest(request)
    setViewOpen(true)
  }

  const queueAction = (type: 'approve' | 'reject', request: CorrectionRequest) => {
    setPendingAction({ type, request })
  }

  const applyStatus = (id: string, status: ApprovalStatus) => {
    setRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    )
    if (viewRequest?.id === id) {
      setViewRequest((prev) => (prev ? { ...prev, status } : prev))
    }
  }

  const confirmPendingAction = () => {
    if (!pendingAction) return
    const { type, request } = pendingAction
    const status: ApprovalStatus = type === 'approve' ? 'Approved' : 'Rejected'
    applyStatus(request.id, status)
    toast(
      type === 'approve'
        ? 'Request approved (UI preview only).'
        : 'Request rejected (UI preview only).',
    )
    setPendingAction(null)
    if (viewOpen && viewRequest?.id === request.id && type === 'reject') {
      setViewOpen(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Attendance Corrections
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Review and action employee attendance correction requests.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-sm">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-muted-bg/70 text-text-secondary">
            <tr>
              <th className="px-3 py-3 font-medium">Employee</th>
              <th className="px-3 py-3 font-medium">Employee ID</th>
              <th className="px-3 py-3 font-medium">Department</th>
              <th className="px-3 py-3 font-medium">Attendance Date</th>
              <th className="px-3 py-3 font-medium">Original In</th>
              <th className="px-3 py-3 font-medium">Requested In</th>
              <th className="px-3 py-3 font-medium">Original Out</th>
              <th className="px-3 py-3 font-medium">Requested Out</th>
              <th className="px-3 py-3 font-medium">Reason</th>
              <th className="px-3 py-3 font-medium">Request Date</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t border-border-soft">
                <td className="px-3 py-3 font-medium text-navy">
                  {request.employeeName}
                </td>
                <td className="px-3 py-3 text-text-secondary">{request.employeeId}</td>
                <td className="px-3 py-3 text-text-secondary">{request.department}</td>
                <td className="px-3 py-3 text-text-secondary">{request.date}</td>
                <td className="px-3 py-3 text-text-secondary">
                  {request.originalCheckIn}
                </td>
                <td className="px-3 py-3 text-text-secondary">
                  {request.requestedCheckIn}
                </td>
                <td className="px-3 py-3 text-text-secondary">
                  {request.originalCheckOut}
                </td>
                <td className="px-3 py-3 text-text-secondary">
                  {request.requestedCheckOut}
                </td>
                <td className="max-w-[200px] truncate px-3 py-3 text-text-secondary">
                  {request.reason}
                </td>
                <td className="px-3 py-3 text-text-secondary">{request.requestDate}</td>
                <td className="px-3 py-3">
                  <ApprovalStatusBadge status={request.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-text-secondary"
                      onClick={() => openView(request)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    {request.status === 'Pending' ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 border-rose-200 text-[#EF4444] hover:bg-rose-50"
                          onClick={() => queueAction('reject', request)}
                        >
                          Reject
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8"
                          onClick={() => queueAction('approve', request)}
                        >
                          Approve
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CorrectionRequestDialog
        open={viewOpen}
        request={viewRequest}
        onOpenChange={setViewOpen}
        onApprove={(request) => queueAction('approve', request)}
        onReject={(request) => queueAction('reject', request)}
      />

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmCopy.title}</DialogTitle>
            <DialogDescription>{confirmCopy.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingAction(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={
                pendingAction?.type === 'reject'
                  ? 'bg-[#EF4444] hover:bg-[#DC2626]'
                  : undefined
              }
              onClick={confirmPendingAction}
            >
              {pendingAction?.type === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastBanner message={message} />
    </div>
  )
}

export default AttendanceCorrectionsPage
