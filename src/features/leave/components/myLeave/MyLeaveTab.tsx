/**
 * My Leave tab with balances, filters, requests table, and apply/cancel flows.
 * Visible to Employee, Manager, and HR demo roles on LeavePage.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetLeaveBalancesQuery } from '../../api/leaveApi'
import { useLeave } from '../../hooks/useLeave'
import { useLeaveEmployeeIdForApi } from '../../hooks/useLeaveEmployeeIdForApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { useMyLeaveActions } from '../../hooks/useMyLeaveActions'
import type { LeaveViewer } from '../../types/viewer'
import { LEAVE_TYPE_CODES } from '../../constants/leaveTypeCodes'
import { canEarnCompOff, canRequestEncashment } from '../../utils/employeeLeavePolicy'
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
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveConfirmDialog } from '../shared/LeaveConfirmDialog'
import { LeaveTableFilters } from '../shared/LeaveTableFilters'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'
import { mapApiLeaveBalanceToCards } from '../../utils/mapApiLeaveBalance'
import { EmployeeLeaveDashboardLiveSection } from './EmployeeLeaveDashboardLiveSection'
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
  const { snapshot, reload } = useLeave()
  const { showToast } = useLeaveToast()
  const [year, setYear] = useState(leaveTodayIso().slice(0, 4))
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<LeaveRequest | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [compOpen, setCompOpen] = useState(false)
  const [encashOpen, setEncashOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null)
  const [saving, setSaving] = useState(false)
  const employee = snapshot?.employees.find((item) => item.id === viewer.employeeId)
  const canFetchLeaves = useShouldFetchLeaveList()
  const employeeIdForApi = useLeaveEmployeeIdForApi(snapshot)

  const requests = useMemo(() => {
    const rows = snapshot?.requests ?? []
    if (snapshot?.requestsSource === 'api') return rows
    return rows.filter((item) => item.employeeId === viewer.employeeId)
  }, [snapshot?.requests, snapshot?.requestsSource, viewer.employeeId])

  const { handleCancel, handleApply } = useMyLeaveActions(
    snapshot,
    viewer,
    employee,
    reload,
    employeeIdForApi,
  )
  const shouldFetchBalances = Boolean(canFetchLeaves && employeeIdForApi)
  const shouldFetchDashboard = shouldFetchBalances
  const {
    data: balanceData,
    isError: balanceIsError,
    error: balanceError,
  } = useGetLeaveBalancesQuery(
    {
      employeeId: employeeIdForApi ?? '',
      year: Number(year),
    },
    { skip: !shouldFetchBalances },
  )

  const mockCards: BalanceCardModel[] = useMemo(() => {
    if (!snapshot) return []
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
  }, [snapshot, viewer.employeeId, year])

  const cards: BalanceCardModel[] = useMemo(() => {
    if (shouldFetchBalances && balanceData && !balanceIsError) {
      return mapApiLeaveBalanceToCards(balanceData)
    }
    return mockCards
  }, [balanceData, balanceIsError, mockCards, shouldFetchBalances])

  const balanceErrorMessage =
    shouldFetchBalances && balanceIsError
      ? getApiErrorMessage(
          balanceError,
          'Unable to load leave balances. Showing cached demo values.',
        )
      : null
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

  const showCompOff = canEarnCompOff(snapshot.settings)
  const showEncashment = canRequestEncashment(snapshot.settings)

  async function submitCancel(row: LeaveRequest) {
    setSaving(true)
    await handleCancel(row)
    setSaving(false)
    setCancelTarget(null)
    showToast(row.status === 'Approved' ? 'Approved leave cancelled.' : 'Request cancelled.')
  }

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="My leave"
        subtitle={myLeaveTabSubtitle(viewer.role)}
        actions={
          <>
            <Button type="button" onClick={() => setApplyOpen(true)}>
              Apply for leave
            </Button>
            {showCompOff ? (
              <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setCompOpen(true)}>
                Earn comp-off
              </Button>
            ) : null}
            {showEncashment ? (
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
      {balanceErrorMessage ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
          role="alert"
        >
          {balanceErrorMessage}
        </p>
      ) : null}
      {employeeIdForApi ? (
        <EmployeeLeaveDashboardLiveSection
          employeeId={employeeIdForApi}
          year={Number(year)}
          enabled={shouldFetchDashboard}
        />
      ) : null}
      <MyLeaveBalanceCards cards={cards} compOffLots={snapshot.compOffLots} employeeId={viewer.employeeId} />
      <MyRequestsTable rows={filtered} onView={setDetail} onCancel={(row) => (row.status === 'Approved' ? setCancelTarget(row) : void submitCancel(row))} canCancel={canCancel} onApply={() => setApplyOpen(true)} />
      <RequestDetailDialog
        open={Boolean(detail)}
        request={detail}
        useLiveApi={snapshot?.requestsSource === 'api'}
        balanceBefore={detail ? ledgerBalanceForType(snapshot.ledger, viewer.employeeId, detail.leaveTypeCode) : 0}
        balanceAfter={
          detail
            ? ledgerBalanceForType(snapshot.ledger, viewer.employeeId, detail.leaveTypeCode) - detail.days
            : 0
        }
        onOpenChange={(open) => !open && setDetail(null)}
      />
      <ApplyLeaveDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        employee={employee}
        settings={snapshot.settings}
        ledger={snapshot.ledger}
        existing={snapshot.requests}
        employees={snapshot.employees}
        saving={saving}
        onSubmit={async (input) => {
          setSaving(true)
          const result = await handleApply(input)
          setSaving(false)
          if (result.ok) {
            showToast('Leave request submitted.')
            setApplyOpen(false)
          } else {
            showToast(result.message)
          }
        }}
      />
      <EarnCompOffDialog open={compOpen} onOpenChange={setCompOpen} onSubmit={() => showToast('Comp-off credit submitted.')} />
      <RequestEncashmentDialog open={encashOpen} onOpenChange={setEncashOpen} onSubmit={() => showToast('Encashment request submitted.')} />
      <LeaveConfirmDialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)} title="Cancel request?" description="This will withdraw the leave request from the approval queue." confirmLabel="Cancel request" loading={saving} danger onConfirm={() => cancelTarget && void submitCancel(cancelTarget)} />
    </div>
  )
}
