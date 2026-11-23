/**

 * Full and final settlement list with stats, filters, and sheet editor.

 * Rendered from PayrollPage on the Final Settlement main tab.

 */



import { CheckCircle2, Clock3, FolderOpen, IndianRupee } from 'lucide-react'

import { useMemo, useState } from 'react'



import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



import { SETTLEMENT_STATUSES } from '../../constants/approvalStatuses'

import { useEmployeeLookup } from '../../hooks/useEmployeeLookup'

import { usePayroll } from '../../hooks/usePayroll'

import { getOpenSettlementEmployeeIds } from '../../utils/employeeExit'

import type { FinalSettlement, SettlementStatus } from '../../types/finalSettlement'

import { formatCurrency } from '../../utils/formatCurrency'

import { createSettlementDraft } from '../../utils/createSettlementDraft'

import { PayrollStatGrid } from '../shared/PayrollStatGrid'

import { PayrollTabHeader } from '../shared/PayrollTabHeader'

import { PayrollTableFilters } from '../shared/PayrollTableFilters'

import { PAYROLL_CARD_TABLE_TITLE } from '../shared/payrollUi'

import { FinalSettlementTable } from './FinalSettlementTable'

import { SettlementDetailPanel } from './SettlementDetailPanel'



const statusOptions = [

  { value: 'all', label: 'All statuses' },

  ...SETTLEMENT_STATUSES.map((item) => ({ value: item, label: item })),

]



export function FinalSettlementTab() {

  const { settlements, payrollMonth, rawEmployees, upsertSettlement } = usePayroll()

  const nameFor = useEmployeeLookup()

  const [search, setSearch] = useState('')

  const [status, setStatus] = useState<SettlementStatus | 'all'>('all')

  const [active, setActive] = useState<FinalSettlement | null>(null)

  const [isUnsaved, setIsUnsaved] = useState(false)

  const [panelOpen, setPanelOpen] = useState(false)



  const filtered = useMemo(

    () =>

      settlements.filter((row) => {

        const haystack = `${nameFor(row.employeeId)} ${row.employeeId}`.toLowerCase()

        return haystack.includes(search.toLowerCase()) && (status === 'all' || row.status === status)

      }),

    [settlements, search, status, nameFor],

  )



  const stats = useMemo(() => {

    const open = settlements.filter((item) => item.status !== 'Paid' && item.status !== 'Rejected').length

    const pending = settlements.filter((item) => item.status === 'Pending approval').length

    const pendingNet = settlements

      .filter((item) => item.status === 'Pending approval')

      .reduce((sum, item) => sum + item.netPayable, 0)

    const paidThisMonth = settlements

      .filter((item) => item.status === 'Paid' && item.timeline.some((t) => t.date.startsWith(payrollMonth)))

      .reduce((sum, item) => sum + item.netPayable, 0)

    return { open, pending, pendingNet, paidThisMonth }

  }, [settlements, payrollMonth])



  function openRow(row: FinalSettlement) {

    setActive(structuredClone(row))

    setIsUnsaved(false)

    setPanelOpen(true)

  }



  function handleNew() {

    const openIds = getOpenSettlementEmployeeIds(settlements)

    const pick = rawEmployees.find((employee) => !openIds.has(employee.id))?.id ?? rawEmployees[0]?.id

    if (!pick) {

      return

    }

    setActive(createSettlementDraft(pick, payrollMonth))

    setIsUnsaved(true)

    setPanelOpen(true)

  }



  async function handleSave(draft: FinalSettlement) {

    const saved = await upsertSettlement(draft)

    setActive(saved)

    setIsUnsaved(false)

  }



  return (

    <div className="flex flex-col gap-6">

      <PayrollTabHeader

        title="Final settlement"

        subtitle="Manage exit settlements, approvals, and payouts."

        payrollMonth={payrollMonth}

        action={<Button type="button" onClick={handleNew}>New settlement</Button>}

      />

      <PayrollStatGrid

        items={[

          { label: 'Open settlements', value: String(stats.open), icon: FolderOpen, tone: 'neutral' },

          { label: 'Pending approval', value: String(stats.pending), icon: Clock3, tone: 'warning' },

          { label: 'Net payable (pending)', value: formatCurrency(stats.pendingNet), icon: IndianRupee, tone: 'primary' },

          { label: 'Paid this month', value: formatCurrency(stats.paidThisMonth), icon: CheckCircle2, tone: 'success' },

        ]}

      />

      <Card>

        <CardHeader className="gap-3 border-b border-hrms-border pb-4">

          <CardTitle className={PAYROLL_CARD_TABLE_TITLE}>Settlements</CardTitle>

          <PayrollTableFilters

            searchId="fs-search"

            searchLabel="Search settlements"

            searchPlaceholder="Search by employee name"

            searchValue={search}

            onSearchChange={setSearch}

            statusId="fs-status"

            statusValue={status}

            statusOptions={statusOptions}

            onStatusChange={(value) => setStatus(value as SettlementStatus | 'all')}

            showing={filtered.length}

            total={settlements.length}

          />

        </CardHeader>

        <CardContent className="overflow-x-auto p-0">

          <FinalSettlementTable rows={filtered} nameFor={nameFor} onOpen={openRow} onNew={handleNew} />

        </CardContent>

      </Card>

      <SettlementDetailPanel

        settlement={active}

        open={panelOpen}

        isUnsaved={isUnsaved}

        onOpenChange={setPanelOpen}

        onSave={handleSave}

        onDiscard={() => {

          setActive(null)

          setIsUnsaved(false)

        }}

      />

    </div>

  )

}

