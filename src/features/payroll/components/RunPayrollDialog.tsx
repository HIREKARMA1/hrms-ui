/**

 * Modal to review payroll readiness before sending for approval.

 * Used from PageHeader Run payroll action on PayrollPage.

 */



import { usePayroll } from '../hooks/usePayroll'

import { usePayrollToast } from '../hooks/usePayrollToast'

import {

  PayrollDialogBody,

  PayrollDialogCloseButton,

  PayrollDialogContent,

  PayrollDialogFooter,

  PayrollDialogFooterActions,

  PayrollDialogHeader,

  PayrollDialogOverlay,

  PayrollDialogPortal,

  PayrollDialogRoot,

} from './shared/PayrollDialog'



export function RunPayrollDialog() {

  const { employees, runDialogOpen, setRunDialogOpen, advancePayrollStage } = usePayroll()

  const { showToast } = usePayrollToast()



  const readyCount = employees.filter((item) => item.status === 'Pending').length

  const attention = employees.filter(

    (item) => item.status === 'Failed' || item.status === 'On Hold',

  )



  function handleSend() {

    advancePayrollStage()

    setRunDialogOpen(false)

    showToast('Payroll sent for approval.')

  }



  return (

    <PayrollDialogRoot open={runDialogOpen} onOpenChange={setRunDialogOpen}>

      <PayrollDialogPortal>

        <PayrollDialogOverlay />

        <PayrollDialogContent size="sm" aria-describedby="run-payroll-desc">

          <PayrollDialogHeader

            title="Run payroll"

            description={`${readyCount} employees are ready for processing this cycle.`}

            descriptionId="run-payroll-desc"

          />

          <PayrollDialogBody className="space-y-2">

            {attention.length > 0 ? (

              <ul className="max-h-40 space-y-2 overflow-y-auto">

                {attention.map((employee) => (

                  <li key={employee.id} className="rounded-lg border border-hrms-border px-3 py-2">

                    <span className="font-medium text-hrms-navy">{employee.name}</span>

                    <span className="text-hrms-text-secondary"> · {employee.status}</span>

                  </li>

                ))}

              </ul>

            ) : (

              <p className="text-hrms-success">No blocking issues found.</p>

            )}

          </PayrollDialogBody>

          <PayrollDialogFooter>

            <PayrollDialogFooterActions

              primaryLabel="Send for approval"

              onPrimary={handleSend}

            />

          </PayrollDialogFooter>

          <PayrollDialogCloseButton />

        </PayrollDialogContent>

      </PayrollDialogPortal>

    </PayrollDialogRoot>

  )

}

