/**

 * Incentives sub-tab with stats, filtered table, and add dialog.

 * Shown when Incentives segment is active under Variable Pay.

 */



import { CheckCircle2, Clock3, IndianRupee, Sparkles } from 'lucide-react'

import { useMemo, useState } from 'react'



import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



import { ITEM_APPROVAL_STATUSES } from '../../constants/approvalStatuses'

import { useEmployeeLookup } from '../../hooks/useEmployeeLookup'

import { usePayroll } from '../../hooks/usePayroll'

import { usePayrollToast } from '../../hooks/usePayrollToast'

import type { ItemApprovalStatus } from '../../types/variablePay'

import { formatCurrency } from '../../utils/formatCurrency'

import { sumIncentiveStats } from '../../utils/variablePayTabStats'

import { PayrollStatGrid } from '../shared/PayrollStatGrid'

import { PayrollTabHeader } from '../shared/PayrollTabHeader'

import { PayrollTableFilters } from '../shared/PayrollTableFilters'

import { PAYROLL_CARD_TABLE_TITLE } from '../shared/payrollUi'

import { AddIncentiveDialog } from './AddIncentiveDialog'

import { IncentivesTable } from './IncentivesTable'



const statusOptions = [

  { value: 'all', label: 'All statuses' },

  ...ITEM_APPROVAL_STATUSES.map((item) => ({ value: item, label: item })),

]



export function IncentivesTab() {

  const { incentives, payrollMonth, updateIncentiveStatus } = usePayroll()

  const nameFor = useEmployeeLookup()

  const { showToast } = usePayrollToast()

  const [search, setSearch] = useState('')

  const [status, setStatus] = useState<ItemApprovalStatus | 'all'>('all')

  const [dialogOpen, setDialogOpen] = useState(false)



  const monthRows = useMemo(

    () => incentives.filter((row) => row.payrollMonth === payrollMonth),

    [incentives, payrollMonth],

  )



  const filtered = useMemo(

    () =>

      monthRows.filter((row) => {

        const haystack = `${nameFor(row.employeeId)} ${row.incentiveType}`.toLowerCase()

        return haystack.includes(search.toLowerCase()) && (status === 'all' || row.status === status)

      }),

    [monthRows, search, status, nameFor],

  )



  const stats = useMemo(() => sumIncentiveStats(monthRows), [monthRows])



  return (

    <div className="flex flex-col gap-6">

      <PayrollTabHeader

        title="Incentives"

        subtitle="Manage sales and performance incentives for the selected month."

        payrollMonth={payrollMonth}

        action={<Button type="button" onClick={() => setDialogOpen(true)}>Add incentive</Button>}

      />

      <PayrollStatGrid

        items={[

          { label: 'Total incentives', value: formatCurrency(stats.totalAmount), icon: IndianRupee, tone: 'primary' },

          { label: 'Entries', value: String(stats.entries), icon: Sparkles, tone: 'neutral' },

          { label: 'Pending approval', value: String(stats.pending), icon: Clock3, tone: 'warning' },

          { label: 'Approved', value: String(stats.approved), icon: CheckCircle2, tone: 'success' },

        ]}

      />

      <Card>

        <CardHeader className="gap-3 border-b border-hrms-border pb-4">

          <CardTitle className={PAYROLL_CARD_TABLE_TITLE}>Incentive entries</CardTitle>

          <PayrollTableFilters

            searchId="inc-search"

            searchLabel="Search incentives"

            searchPlaceholder="Search by employee or type"

            searchValue={search}

            onSearchChange={setSearch}

            statusId="inc-status"

            statusValue={status}

            statusOptions={statusOptions}

            onStatusChange={(value) => setStatus(value as ItemApprovalStatus | 'all')}

            showing={filtered.length}

            total={monthRows.length}

          />

        </CardHeader>

        <CardContent className="overflow-x-auto p-0">

          <IncentivesTable

            rows={filtered}

            nameFor={nameFor}

            onApprove={(id) => void updateIncentiveStatus(id, 'Approved').then(() => showToast('Approved.'))}

            onReject={async (id) => {

              const reason = window.prompt('Rejection reason (required)')

              if (!reason?.trim()) {

                showToast('Rejection reason is required.')

                return

              }

              await updateIncentiveStatus(id, 'Rejected', reason.trim())

              showToast('Incentive rejected.')

            }}

            onAdd={() => setDialogOpen(true)}

          />

        </CardContent>

      </Card>

      <AddIncentiveDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={() => showToast('Incentive saved.')} />

    </div>

  )

}

