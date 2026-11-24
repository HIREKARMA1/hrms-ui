/**
 * My Leave tab with balances, filters, requests table, and apply/cancel flows.
 * Visible to Employee, Manager, and HR demo roles on LeavePage.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { getLeaveErrorMessage, useGetLeaveBalanceQuery } from '../../api/leaveApi'
import { availableByTypeCode, mapLeaveBalanceRows } from '../../api/leaveMappers'
import { useLeave } from '../../hooks/useLeave'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useMyLeaveActions } from '../../hooks/useMyLeaveActions'
import { isLinkedLeaveViewer, type LeaveViewer, type LinkedLeaveViewer } from '../../types/viewer'
import { LEAVE_TYPE_CODES, type LeaveTypeCode } from '../../constants/leaveTypeCodes'
import { canEarnCompOff, canRequestEncashment } from '../../utils/employeeLeavePolicy'
import { resolveMyLeaveEmployee } from '../../utils/leaveEmployeeFromViewer'
import { myLeaveTabSubtitle } from '../../utils/myLeaveTabSubtitle'
import { balanceCardHint } from '../../utils/balanceCardHint'
import { resolveEarningModel } from '../../utils/leaveEarningModel'
import { ledgerBalanceForType, pendingDaysForType, usedDaysForType } from '../../utils/calculateBalance'
import { leaveTodayIso } from '../../utils/leaveToday'
import type { LeaveRequest } from '../../types/leaveRequest'
import { ApplyLeaveDialog } from '../applyLeave/ApplyLeaveDialog'
import { EarnCompOffDialog } from '../dialogs/EarnCompOffDialog'
import { RequestDetailDialog } from '../dialogs/RequestDetailDialog'
import { RequestEncashmentDialog } from '../dialogs/RequestEncashmentDialog'
import { LeaveErrorState } from '../LeaveErrorState'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveConfirmDialog } from '../shared/LeaveConfirmDialog'
import { LeaveEmployeeLinkNotice } from '../shared/LeaveEmployeeLinkNotice'
import { LeaveTableFilters } from '../shared/LeaveTableFilters'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'
import { MyLeaveBalanceCards, type BalanceCardModel } from './MyLeaveBalanceCards'
import { MyLeaveTabOverviewSection } from './MyLeaveTabOverviewSection'
import { MyRequestsTable } from './MyRequestsTable'

type MyLeaveTabProps = { viewer: LeaveViewer }

function canCancel(row: LeaveRequest) {
  if (row.status === 'Pending') return true
  if (row.status === 'Approved' && row.fromDate > leaveTodayIso()) return true
  return false
}

export function MyLeaveTab({ viewer }: MyLeaveTabProps) {
  if (!isLinkedLeaveViewer(viewer)) {
    return (
      <div className="space-y-6">
        <LeaveTabHeader title="My leave" subtitle={myLeaveTabSubtitle(viewer.role)} />
        <LeaveEmployeeLinkNotice />
      </div>
    )
  }
  return <MyLeaveTabContent viewer={viewer} />
}

function MyLeaveTabContent({ viewer }: { viewer: LinkedLeaveViewer }) {
  const { snapshot, reload } = useLeave()
  const { showToast } = useLeaveToast()
  const permissions = useLeavePermissions()
  const [year, setYear] = useState(leaveTodayIso().slice(0, 4))
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<LeaveRequest | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [compOpen, setCompOpen] = useState(false)
  const [encashOpen, setEncashOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null)
  const [saving, setSaving] = useState(false)
  const employee = snapshot ? resolveMyLeaveEmployee(snapshot.employees, viewer) : undefined
  const { handleCancel, handleApply } = useMyLeaveActions(snapshot, viewer, employee, reload)
  const api = snapshot?.api
  const serverBalance = useGetLeaveBalanceQuery(
    { employeeId: viewer.employeeId, year: Number(year) },
    { skip: !api },
  )
  const serverRows = useMemo(
    () => (api && serverBalance.data ? mapLeaveBalanceRows(serverBalance.data, api.leaveTypes) : null),
    [api, serverBalance.data],
  )
  const balanceError =
    api && serverBalance.isError && !serverBalance.data
      ? getLeaveErrorMessage(serverBalance.error, 'Could not load your leave balances.')
      : null

  const requests = useMemo(
    () => snapshot?.requests.filter((item) => item.employeeId === viewer.employeeId) ?? [],
    [snapshot?.requests, viewer.employeeId],
  )
  const cards: BalanceCardModel[] = useMemo(() => {
    if (!snapshot) return []
    if (snapshot.api) {
      // Balance cards only render the known type codes.
      return (serverRows ?? [])
        .filter((row) => (LEAVE_TYPE_CODES as readonly string[]).includes(row.leaveTypeCode))
        .map((row) => ({ code: row.leaveTypeCode as LeaveTypeCode, available: row.available, used: row.used, pending: row.pending }))
    }
    const rows: BalanceCardModel[] = []
    for (const code of LEAVE_TYPE_CODES) {
      const policy = snapshot.settings.leaveTypes.find((item) => item.code === code)
      if (policy && !policy.enabled) continue
      const available = ledgerBalanceForType(snapshot.ledger, viewer.employeeId, code) - pendingDaysForType(snapshot.requests, viewer.employeeId, code)
      const used = usedDaysForType(snapshot.requests, viewer.employeeId, code, year)
      const pending = pendingDaysForType(snapshot.requests, viewer.employeeId, code)
      const hint = balanceCardHint(policy)
      const perEvent = policy ? resolveEarningModel(policy) === 'per_event' : false
      if (!perEvent && available <= 0 && used <= 0 && pending <= 0) continue
      const row: BalanceCardModel = { code, available, used, pending }
      if (hint) row.hint = hint
      rows.push(row)
    }
    return rows
  }, [serverRows, snapshot, viewer.employeeId, year])
  const yearRows = useMemo(() => requests.filter((item) => item.fromDate.startsWith(year)), [requests, year])
  const filtered = useMemo(
    () =>
      yearRows.filter(
        (item) =>
          !search.trim() ||
          item.leaveTypeCode.toLowerCase().includes(search.toLowerCase()) ||
          item.reason.toLowerCase().includes(search.toLowerCase()),
      ),
    [yearRows, search],
  )

  if (!snapshot || !employee) return null

  // Comp-off and encashment requests have no integrated server flow yet.
  const showCompOff = !api && canEarnCompOff(snapshot.settings)
  const showEncashment = !api && canRequestEncashment(snapshot.settings)
  const serverBalances = api ? (serverRows ? availableByTypeCode(serverRows) : null) : undefined
  const detailBalance = detail && !api ? ledgerBalanceForType(snapshot.ledger, viewer.employeeId, detail.leaveTypeCode) : null

  async function submitCancel(row: LeaveRequest) {
    setSaving(true)
    const result = await handleCancel(row)
    setSaving(false)
    setCancelTarget(null)
    showToast(result.ok ? (row.status === 'Approved' ? 'Approved leave cancelled.' : 'Request cancelled.') : result.message)
  }

  async function submitApply(input: Parameters<typeof handleApply>[0]) {
    setSaving(true)
    const result = await handleApply(input)
    setSaving(false)
    showToast(result.ok ? 'Leave request submitted.' : result.message)
    return result.ok
  }

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="My leave"
        subtitle={myLeaveTabSubtitle(viewer.role)}
        actions={
          <>
            {permissions.canCreate ? (
              <Button type="button" onClick={() => setApplyOpen(true)}>
                Apply for leave
              </Button>
            ) : null}
            {showCompOff ? (
              <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setCompOpen(true)}>
                Earn comp-off
              </Button>
            ) : null}
            {showEncashment && permissions.canRequestEncashment ? (
              <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setEncashOpen(true)}>
                Request encashment
              </Button>
            ) : null}
          </>
        }
      />
      <MyLeaveTabOverviewSection
        viewer={viewer}
        snapshot={snapshot}
        cards={cards}
        requests={requests}
        compOffLots={snapshot.compOffLots}
      />
      <LeaveTableFilters searchId="my-leave-search" searchPlaceholder="Search requests" searchValue={search} onSearchChange={setSearch} selectId="my-leave-year" selectValue={year} selectOptions={[{ value: '2026', label: '2026' }, { value: '2025', label: '2025' }]} onSelectChange={setYear} showing={filtered.length} total={yearRows.length} />
      {balanceError ? (
        <LeaveErrorState
          message={balanceError}
          onRetry={() => void serverBalance.refetch()}
        />
      ) : (
        <MyLeaveBalanceCards cards={cards} compOffLots={snapshot.compOffLots} employeeId={viewer.employeeId} />
      )}
      <MyRequestsTable rows={filtered} onView={setDetail} onCancel={(row) => (row.status === 'Approved' ? setCancelTarget(row) : void submitCancel(row))} canCancel={(row) => permissions.canCancel && canCancel(row)} onApply={permissions.canCreate ? () => setApplyOpen(true) : undefined} />
      <RequestDetailDialog open={Boolean(detail)} request={detail} balanceBefore={detailBalance} balanceAfter={detail && detailBalance !== null ? detailBalance - detail.days : null} onOpenChange={(open) => !open && setDetail(null)} />
      <ApplyLeaveDialog open={applyOpen} onOpenChange={setApplyOpen} employee={employee} settings={snapshot.settings} ledger={snapshot.ledger} existing={snapshot.requests} employees={snapshot.employees} saving={saving} serverBalances={serverBalances} onSubmit={submitApply} />
      <EarnCompOffDialog open={compOpen} onOpenChange={setCompOpen} onSubmit={() => showToast('Comp-off credit submitted.')} />
      <RequestEncashmentDialog open={encashOpen} onOpenChange={setEncashOpen} onSubmit={() => showToast('Encashment request submitted.')} />
      <LeaveConfirmDialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)} title="Cancel request?" description="This will withdraw the leave request from the approval queue." confirmLabel="Cancel request" loading={saving} danger onConfirm={() => cancelTarget && void submitCancel(cancelTarget)} />
    </div>
  )
}
