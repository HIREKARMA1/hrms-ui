/**
 * My Leave tab with balances, filters, requests table, and apply/cancel flows.
 * Visible to Employee, Manager, and HR demo roles on LeavePage.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

import { useLeave } from '../../hooks/useLeave'
import { useMyLeaveActions } from '../../hooks/useMyLeaveActions'
import type { LeaveViewer } from '../../types/viewer'
import { BALANCE_TYPE_CODES } from '../../constants/leaveTypeCodes'
import { ledgerBalanceForType, pendingDaysForType, usedDaysForType } from '../../utils/calculateBalance'
import { leaveTodayIso } from '../../utils/leaveToday'
import type { LeaveRequest } from '../../types/leaveRequest'
import { LeaveStatGrid } from '../LeaveStatGrid'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { MyLeaveBalanceCards, type BalanceCardModel } from './MyLeaveBalanceCards'
import { MyRequestsTable } from './MyRequestsTable'
import { RequestDetailSheet } from './RequestDetailSheet'
import { ApplyLeaveSheet } from './ApplyLeaveSheet'

type MyLeaveTabProps = {
  viewer: LeaveViewer
}

function canCancel(row: LeaveRequest) {
  if (row.status === 'Pending') {
    return true
  }
  if (row.status === 'Approved' && row.fromDate > leaveTodayIso()) {
    return true
  }
  return false
}

export function MyLeaveTab({ viewer }: MyLeaveTabProps) {
  const { snapshot, reload } = useLeave()
  const [year, setYear] = useState(leaveTodayIso().slice(0, 4))
  const [detail, setDetail] = useState<LeaveRequest | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const employee = snapshot?.employees.find((item) => item.id === viewer.employeeId)
  const { handleCancel, handleApply } = useMyLeaveActions(snapshot, viewer, employee, reload)

  const requests = useMemo(
    () => snapshot?.requests.filter((item) => item.employeeId === viewer.employeeId) ?? [],
    [snapshot?.requests, viewer.employeeId],
  )
  const cards: BalanceCardModel[] = useMemo(
    () =>
      snapshot
        ? BALANCE_TYPE_CODES.map((code) => {
            const balance = ledgerBalanceForType(snapshot.ledger, viewer.employeeId, code)
            const pending = pendingDaysForType(snapshot.requests, viewer.employeeId, code)
            return {
              code,
              available: balance - pending,
              used: usedDaysForType(snapshot.requests, viewer.employeeId, code, year),
              pending,
            }
          }).filter((item) => item.available > 0 || item.used > 0 || item.pending > 0)
        : [],
    [snapshot, viewer.employeeId, year],
  )
  const filtered = useMemo(() => requests.filter((item) => item.fromDate.startsWith(year)), [requests, year])
  const stats = useMemo(
    () => [
      { label: 'Available CL', value: String(cards.find((item) => item.code === 'CL')?.available ?? 0) },
      { label: 'Pending requests', value: String(requests.filter((item) => item.status === 'Pending').length) },
      { label: 'Approved this year', value: String(requests.filter((item) => item.status === 'Approved').length) },
      {
        label: 'Comp-off lots',
        value: String(snapshot?.compOffLots.filter((item) => item.employeeId === viewer.employeeId).length ?? 0),
      },
    ],
    [cards, requests, snapshot?.compOffLots, viewer.employeeId],
  )

  if (!snapshot || !employee) {
    return null
  }

  const balanceBefore = detail
    ? ledgerBalanceForType(snapshot.ledger, viewer.employeeId, detail.leaveTypeCode)
    : 0

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="My leave"
        subtitle="Balances, history, and new requests for your account."
        actions={
          <>
            <Button type="button" onClick={() => setApplyOpen(true)}>
              Apply for leave
            </Button>
            <Button type="button" variant="outline">
              Earn comp-off
            </Button>
            <Button type="button" variant="outline">
              Request encashment
            </Button>
          </>
        }
      />
      <LeaveStatGrid items={stats} />
      <MyLeaveBalanceCards cards={cards} compOffLots={snapshot.compOffLots} employeeId={viewer.employeeId} />
      <div className="flex flex-wrap gap-2 text-sm">
        <label className="flex items-center gap-2">
          Year
          <select className="h-9 rounded-lg border border-hrms-border px-2" value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </label>
      </div>
      <MyRequestsTable rows={filtered} onView={setDetail} onCancel={handleCancel} canCancel={canCancel} />
      <RequestDetailSheet
        open={Boolean(detail)}
        request={detail}
        balanceBefore={balanceBefore}
        balanceAfter={balanceBefore - (detail?.days ?? 0)}
        onOpenChange={(open) => !open && setDetail(null)}
      />
      <ApplyLeaveSheet
        open={applyOpen}
        onOpenChange={setApplyOpen}
        employee={employee}
        settings={snapshot.settings}
        ledger={snapshot.ledger}
        existing={snapshot.requests}
        employees={snapshot.employees}
        onSubmit={handleApply}
      />
    </div>
  )
}
