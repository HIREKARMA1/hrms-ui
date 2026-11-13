/**

 * Bonus runs sub-tab with stats, filters, and prepare dialog.

 * Rendered when Bonus segment is active under Variable Pay.

 */



import { Gift, IndianRupee, Layers, Users } from 'lucide-react'

import { useMemo, useState } from 'react'



import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



import { BONUS_RUN_STATUSES } from '../../constants/approvalStatuses'

import { usePayroll } from '../../hooks/usePayroll'

import { usePayrollToast } from '../../hooks/usePayrollToast'

import type { BonusRunStatus } from '../../types/variablePay'

import { formatCurrency } from '../../utils/formatCurrency'

import { sumBonusRunStats } from '../../utils/variablePayTabStats'

import { PayrollStatGrid } from '../shared/PayrollStatGrid'

import { PayrollTabHeader } from '../shared/PayrollTabHeader'

import { PayrollTableFilters } from '../shared/PayrollTableFilters'

import { PAYROLL_CARD_TABLE_TITLE } from '../shared/payrollUi'

import { BonusRunsTable } from './BonusRunsTable'

import { PrepareBonusRunDialog } from './PrepareBonusRunDialog'



const statusOptions = [

  { value: 'all', label: 'All statuses' },

  ...BONUS_RUN_STATUSES.map((item) => ({ value: item, label: item })),

]



export function BonusTab() {

  const { bonusRuns, payrollMonth, updateBonusRunStatus } = usePayroll()

  const { showToast } = usePayrollToast()

  const [search, setSearch] = useState('')

  const [status, setStatus] = useState<BonusRunStatus | 'all'>('all')

  const [dialogOpen, setDialogOpen] = useState(false)



  const monthRuns = useMemo(

    () => bonusRuns.filter((run) => run.payoutMonth === payrollMonth),

    [bonusRuns, payrollMonth],

  )



  const filtered = useMemo(

    () =>

      monthRuns.filter(

        (run) =>

          `${run.bonusType} ${run.periodLabel}`.toLowerCase().includes(search.toLowerCase()) &&

          (status === 'all' || run.status === status),

      ),

    [monthRuns, search, status],

  )



  const stats = useMemo(() => sumBonusRunStats(monthRuns), [monthRuns])



  return (

    <div className="flex flex-col gap-6">

      <PayrollTabHeader

        title="Bonus runs"

        subtitle="Prepare and approve bonus runs for the payout month."

        payrollMonth={payrollMonth}

        action={<Button type="button" onClick={() => setDialogOpen(true)}>New bonus run</Button>}

      />

      <PayrollStatGrid

        items={[

          { label: 'Bonus runs', value: String(stats.runs), icon: Layers, tone: 'primary' },

          { label: 'Total bonus amount', value: formatCurrency(stats.totalBonus), icon: IndianRupee, tone: 'neutral' },

          { label: 'Employees included', value: String(stats.includedEmployees), icon: Users, tone: 'neutral' },

          { label: 'Draft runs', value: String(stats.draftRuns), icon: Gift, tone: 'warning' },

        ]}

      />

      <Card>

        <CardHeader className="gap-3 border-b border-hrms-border pb-4">

          <CardTitle className={PAYROLL_CARD_TABLE_TITLE}>Bonus runs</CardTitle>

          <PayrollTableFilters

            searchId="br-search"

            searchLabel="Search bonus runs"

            searchPlaceholder="Search by type or period"

            searchValue={search}

            onSearchChange={setSearch}

            statusId="br-status"

            statusValue={status}

            statusOptions={statusOptions}

            onStatusChange={(value) => setStatus(value as BonusRunStatus | 'all')}

            showing={filtered.length}

            total={monthRuns.length}

          />

        </CardHeader>

        <CardContent className="overflow-x-auto p-0">

          <BonusRunsTable

            rows={filtered}

            onApprove={(id) => void confirmApprove(id, updateBonusRunStatus, showToast)}

            onMarkPaid={(id) => void updateBonusRunStatus(id, 'Paid').then(() => showToast('Marked paid.'))}

            onNew={() => setDialogOpen(true)}

          />

        </CardContent>

      </Card>

      <PrepareBonusRunDialog open={dialogOpen} onOpenChange={setDialogOpen} onPrepared={() => showToast('Draft saved.')} />

    </div>

  )

}



async function confirmApprove(

  id: string,

  update: (id: string, status: 'Approved') => Promise<unknown>,

  showToast: (message: string) => void,

) {

  if (!window.confirm('Approve this bonus run for payroll inclusion?')) {

    return

  }

  await update(id, 'Approved')

  showToast('Bonus run approved.')

}

