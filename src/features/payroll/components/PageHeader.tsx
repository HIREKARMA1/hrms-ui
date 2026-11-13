/**

 * Payroll page title row with month picker and primary actions.

 * Used at the top of PayrollPage above section tabs.

 */



import { CalendarRange, FileSpreadsheet, Play } from 'lucide-react'



import { Button } from '@/components/ui/button'



import { usePayroll } from '../hooks/usePayroll'

import { usePayrollToast } from '../hooks/usePayrollToast'



export function PageHeader() {

  const { payrollMonth, setPayrollMonth, setRunDialogOpen } = usePayroll()

  const { showToast } = usePayrollToast()



  return (

    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">

      <h1 className="m-0 text-2xl font-bold leading-tight tracking-tight text-hrms-navy">
        Payroll Management
      </h1>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">

        <label className="flex items-center gap-2 text-sm text-hrms-text-secondary">

          <span className="sr-only">Payroll month</span>

          <CalendarRange className="h-4 w-4 text-hrms-text-muted" aria-hidden />

          <input

            type="month"

            value={payrollMonth}

            onChange={(event) => setPayrollMonth(event.target.value)}

            className="h-10 rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus"

            aria-label="Payroll month"

          />

        </label>

        <Button

          type="button"

          variant="outline"

          className="h-10 gap-2 border-hrms-border bg-hrms-lavender text-hrms-primary hover:bg-hrms-lavender/80"

          onClick={() => showToast('Excel export will be available with the API.')}

        >

          <FileSpreadsheet className="h-4 w-4" aria-hidden />

          Export to Excel

        </Button>

        <Button

          type="button"

          className="h-10 gap-2 bg-hrms-primary hover:bg-hrms-primary-hover"

          onClick={() => setRunDialogOpen(true)}

        >

          <Play className="h-4 w-4" aria-hidden />

          Run payroll

        </Button>

      </div>

    </div>

  )

}

