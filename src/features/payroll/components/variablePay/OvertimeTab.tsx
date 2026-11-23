/**

 * Overtime sub-tab with stat cards, filters, table, and add dialog.

 * Rendered inside VariablePayTab on PayrollPage.

 */



import { CheckCircle2, Clock3, IndianRupee, Timer } from 'lucide-react'

import { useMemo, useState } from 'react'



import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



import { ITEM_APPROVAL_STATUSES } from '../../constants/approvalStatuses'

import { useEmployeeLookup } from '../../hooks/useEmployeeLookup'

import { usePayroll } from '../../hooks/usePayroll'

import { usePayrollToast } from '../../hooks/usePayrollToast'

import type { ItemApprovalStatus } from '../../types/variablePay'

import { formatCurrency } from '../../utils/formatCurrency'

import { sumOvertimeStats } from '../../utils/variablePayTabStats'

import { PayrollStatGrid } from '../shared/PayrollStatGrid'

import { PayrollTabHeader } from '../shared/PayrollTabHeader'

import { PayrollTableFilters } from '../shared/PayrollTableFilters'

import { PAYROLL_CARD_TABLE_TITLE } from '../shared/payrollUi'

import { AddOvertimeDialog } from './AddOvertimeDialog'

import { OvertimeTable } from './OvertimeTable'



const statusOptions = [

  { value: 'all', label: 'All statuses' },

  ...ITEM_APPROVAL_STATUSES.map((item) => ({ value: item, label: item })),

]



export function OvertimeTab() {

  const { overtime, payrollMonth, updateOvertimeStatus } = usePayroll()

  const nameFor = useEmployeeLookup()

  const { showToast } = usePayrollToast()

  const [search, setSearch] = useState('')

  const [status, setStatus] = useState<ItemApprovalStatus | 'all'>('all')

  const [dialogOpen, setDialogOpen] = useState(false)



  const monthRows = useMemo(

    () => overtime.filter((row) => row.payrollMonth === payrollMonth),

    [overtime, payrollMonth],

  )



  const filtered = useMemo(

    () =>

      monthRows.filter((row) => {

        const haystack = `${nameFor(row.employeeId)} ${row.employeeId}`.toLowerCase()

        return haystack.includes(search.toLowerCase()) && (status === 'all' || row.status === status)

      }),

    [monthRows, search, status, nameFor],

  )



  const stats = useMemo(() => sumOvertimeStats(monthRows), [monthRows])



  async function handleReject(id: string) {

    const reason = window.prompt('Rejection reason (required)')

    if (!reason?.trim()) {

      showToast('Rejection reason is required.')

      return

    }

    await updateOvertimeStatus(id, 'Rejected', reason.trim())

    showToast('Overtime rejected.')

  }



  return (

    <div className="flex flex-col gap-6">

      <PayrollTabHeader

        title="Overtime"

        subtitle="Track overtime hours and approvals for the selected month."

        payrollMonth={payrollMonth}

        action={

          <Button type="button" onClick={() => setDialogOpen(true)}>

            Add overtime

          </Button>

        }

      />

      <PayrollStatGrid

        items={[

          { label: 'Total hours', value: String(stats.totalHours), icon: Timer, tone: 'primary' },

          { label: 'Total amount', value: formatCurrency(stats.totalAmount), icon: IndianRupee, tone: 'neutral' },

          { label: 'Pending approval', value: String(stats.pending), icon: Clock3, tone: 'warning' },

          { label: 'Approved', value: String(stats.approved), icon: CheckCircle2, tone: 'success' },

        ]}

      />

      <Card>

        <CardHeader className="gap-3 border-b border-hrms-border pb-4">

          <CardTitle className={PAYROLL_CARD_TABLE_TITLE}>Overtime entries</CardTitle>

          <PayrollTableFilters

            searchId="ot-search"

            searchLabel="Search overtime"

            searchPlaceholder="Search by employee name"

            searchValue={search}

            onSearchChange={setSearch}

            statusId="ot-status"

            statusValue={status}

            statusOptions={statusOptions}

            onStatusChange={(value) => setStatus(value as ItemApprovalStatus | 'all')}

            showing={filtered.length}

            total={monthRows.length}

          />

        </CardHeader>

        <CardContent className="overflow-x-auto p-0">

          <OvertimeTable

            rows={filtered}

            nameFor={nameFor}

            onApprove={(id) =>

              void updateOvertimeStatus(id, 'Approved').then(() => showToast('Approved.'))

            }

            onReject={handleReject}

            onAdd={() => setDialogOpen(true)}

          />

        </CardContent>

      </Card>

      <AddOvertimeDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={() => showToast('Overtime saved.')} />

    </div>

  )

}

