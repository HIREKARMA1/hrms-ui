/**
 * HR Reports tab with three CSV-exportable tables (no chart library).
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

import { useLeave } from '../../hooks/useLeave'
import { leaveTodayIso } from '../../utils/leaveToday'
import { csvFilename, downloadCsv } from '../../utils/downloadCsv'
import { BALANCE_SUMMARY_HEADERS, balanceSummaryRows } from '../../utils/reportBalanceSummary'
import { leaveTakenByDeptRows, leaveTakenByTypeRows } from '../../utils/reportLeaveTaken'
import { encashmentReportRows } from '../../utils/reportEncashment'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveSegmentedControl } from '../shared/LeaveSegmentedControl'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LeaveServerNotice } from '../shared/LeaveServerNotice'
import { ReportTable } from './ReportTable'

type ReportId = 'balance' | 'taken' | 'encashment'

const SEGMENTS = [
  { value: 'balance' as const, label: 'Balance summary' },
  { value: 'taken' as const, label: 'Leave taken' },
  { value: 'encashment' as const, label: 'Encashment' },
]

export function ReportsTab() {
  const { snapshot } = useLeave()
  const [report, setReport] = useState<ReportId>('balance')
  const [takenMode, setTakenMode] = useState<'type' | 'department'>('type')
  const year = leaveTodayIso().slice(0, 4)

  const table = useMemo(() => {
    if (!snapshot) return { headers: [] as string[], rows: [] as (string | number)[][] }
    // The balance summary is ledger-based; server snapshots carry no ledger.
    if (report === 'balance') return { headers: BALANCE_SUMMARY_HEADERS, rows: snapshot.api ? [] : balanceSummaryRows(snapshot) }
    if (report === 'encashment') return { headers: ['Employee', 'Days', 'Status', 'Requested on'], rows: encashmentReportRows(snapshot) }
    const headers = takenMode === 'type' ? ['Month', 'Type', 'Days'] : ['Month', 'Department', 'Days']
    const rows = takenMode === 'type' ? leaveTakenByTypeRows(snapshot, year) : leaveTakenByDeptRows(snapshot, year)
    return { headers, rows }
  }, [report, snapshot, takenMode, year])

  if (!snapshot) return null

  function exportCsv() {
    const name = report === 'balance' ? 'balance-summary' : report === 'encashment' ? 'encashment' : 'leave-taken'
    downloadCsv(csvFilename(name), table.headers, table.rows)
  }

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Reports" subtitle="Download leave data as CSV." actions={<Button type="button" onClick={exportCsv} disabled={table.rows.length === 0}>Download CSV</Button>} />
      {snapshot.api ? (
        <LeaveServerNotice>
          Reports use the {snapshot.requests.length} most recent leave requests and {snapshot.encashments.length} encashment requests loaded from the server.
          The balance summary needs ledger data the server does not provide yet; see the Balances tab for per-employee balances.
        </LeaveServerNotice>
      ) : null}
      <LeaveSegmentedControl options={SEGMENTS} value={report} onChange={setReport} ariaLabel="Reports" />
      {report === 'taken' ? (
        <LeaveSegmentedControl
          options={[
            { value: 'type', label: 'By type' },
            { value: 'department', label: 'By department' },
          ]}
          value={takenMode}
          onChange={setTakenMode}
          ariaLabel="Leave taken grouping"
        />
      ) : null}
      {table.rows.length === 0 ? <LeaveEmptyState message="No data for this report." /> : <ReportTable headers={table.headers} rows={table.rows} />}
    </div>
  )
}
