/**
 * Manager and HR approvals with segmented leave, encashment, and comp-off lists.
 * Shown on LeavePage when demo role is Manager or HR.
 */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { useLeave } from '../../hooks/useLeave'
import type { LeaveViewer } from '../../types/viewer'
import { LeaveStatGrid } from '../LeaveStatGrid'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { formatDate } from '../../utils/formatDate'
import { approveRequest, rejectRequest } from '../../services/leaveService'
import { RequestDetailSheet } from '../myLeave/RequestDetailSheet'
import type { LeaveRequest } from '../../types/leaveRequest'
import { ledgerBalanceForType } from '../../utils/calculateBalance'

type ApprovalsTabProps = {
  viewer: LeaveViewer
}

type Segment = 'leave' | 'encashment' | 'comp-off'

export function ApprovalsTab({ viewer }: ApprovalsTabProps) {
  const { snapshot, reload } = useLeave()
  const [segment, setSegment] = useState<Segment>('leave')
  const [detail, setDetail] = useState<LeaveRequest | null>(null)
  if (!snapshot) {
    return null
  }
  const pendingLeave = snapshot.requests.filter((item) => {
    if (item.status !== 'Pending') {
      return false
    }
    if (viewer.role === 'Manager') {
      const emp = snapshot.employees.find((row) => row.id === item.employeeId)
      return item.currentLevel === 'Manager' && emp?.managerId === viewer.employeeId
    }
    return item.currentLevel === 'HR' || item.escalated
  })

  async function onApprove(id: string) {
    const level = viewer.role === 'Manager' ? 'Manager' : 'HR'
    approveRequest(id, viewer.employeeId, viewer.displayName, level)
    await reload()
  }

  async function onReject(id: string) {
    rejectRequest(id, viewer.employeeId, viewer.displayName, 'Not approved')
    await reload()
  }

  const employeeName = (id: string) => snapshot.employees.find((item) => item.id === id)?.name ?? id

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Approvals" subtitle="Review pending leave, encashment, and comp-off requests." actions={<Button type="button" variant="outline">Set delegate</Button>} />
      <LeaveStatGrid
        items={[
          { label: 'Pending leave', value: String(pendingLeave.length) },
          { label: 'Encashment queue', value: String(snapshot.encashments.filter((item) => item.status === 'Pending approval').length) },
          { label: 'Comp-off queue', value: String(snapshot.compOffRequests.filter((item) => item.status === 'Pending').length) },
          { label: 'Escalated', value: String(snapshot.requests.filter((item) => item.escalated).length) },
        ]}
      />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Approval queues">
        {(
          [
            ['leave', 'Leave requests'],
            ['encashment', 'Encashment requests'],
            ['comp-off', 'Comp-off requests'],
          ] as const
        ).map(([key, label]) => (
          <Button key={key} type="button" size="sm" variant={segment === key ? 'default' : 'outline'} onClick={() => setSegment(key)}>
            {label}
          </Button>
        ))}
      </div>
      {segment === 'leave' ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-hrms-page text-hrms-text-secondary">
                <tr>
                  {['Employee', 'Type', 'Dates', 'Days', 'Applied on', 'Level', 'Status', 'Actions'].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingLeave.map((row) => (
                  <tr key={row.id} className="border-b border-hrms-border/60">
                    <td className="px-4 py-3">{employeeName(row.employeeId)}</td>
                    <td className="px-4 py-3">{row.leaveTypeCode}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(row.fromDate)} – {formatDate(row.toDate)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{row.days}</td>
                    <td className="px-4 py-3">{formatDate(row.appliedOn)}</td>
                    <td className="px-4 py-3">{row.currentLevel}</td>
                    <td className="px-4 py-3">
                      <LeaveStatusPill status={row.currentStepLabel} />
                      {row.escalated ? <LeaveStatusPill status="Escalated" className="ml-1" /> : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => setDetail(row)}>
                          View
                        </Button>
                        <Button type="button" size="sm" onClick={() => void onApprove(row.id)}>
                          Approve
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => void onReject(row.id)}>
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
      <RequestDetailSheet
        open={Boolean(detail)}
        request={detail}
        balanceBefore={detail ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) : 0}
        balanceAfter={detail ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) - detail.days : 0}
        onOpenChange={(open) => !open && setDetail(null)}
      />
    </div>
  )
}
