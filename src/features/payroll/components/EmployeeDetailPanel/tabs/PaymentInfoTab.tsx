/**

 * Payment status, reference, and processing timeline tab.

 * Used inside EmployeeDetailPanel.

 */



import type { ReactNode } from 'react'



import type { EmployeeWithComputed } from '../../../types/payroll'

import { buildPaymentTimeline } from '../../../utils/buildTimeline'

import { formatDate } from '../../../utils/formatDate'

import { StatusPill } from '../../StatusPill'



type PaymentInfoTabProps = {

  employee: EmployeeWithComputed

}



export function PaymentInfoTab({ employee }: PaymentInfoTabProps) {

  const timeline = buildPaymentTimeline(employee)



  return (

    <div className="space-y-5 text-sm">

      <dl className="grid min-w-0 gap-3 sm:grid-cols-2">

        <Field label="Status" value={<StatusPill status={employee.status} />} />

        <Field label="Paid on" value={formatDate(employee.paidOn)} />

        <Field label="Mode" value={employee.paymentMode ?? '—'} />

        <Field label="Reference" value={employee.referenceNumber ?? '—'} />

      </dl>

      <div>

        <p className="mb-1 font-semibold text-hrms-navy">Remarks</p>

        <p className="break-words text-hrms-text-secondary">

          {employee.remarks ?? 'No remarks'}

        </p>

        {employee.failureReason ? (

          <p className="mt-2 break-words text-hrms-danger">{employee.failureReason}</p>

        ) : null}

      </div>

      <ol className="space-y-2 border-l border-hrms-border pl-4">

        {timeline.map((step) => (

          <li

            key={step.label}

            className={

              step.failed

                ? 'text-hrms-danger'

                : step.completed

                  ? 'text-hrms-success'

                  : 'text-hrms-text-muted'

            }

          >

            {step.label}

            {step.completed ? ' ✓' : ''}

          </li>

        ))}

      </ol>

    </div>

  )

}



function Field({ label, value }: { label: string; value: ReactNode }) {

  return (

    <div className="min-w-0">

      <dt className="text-hrms-text-muted">{label}</dt>

      <dd className="mt-0.5 break-words font-medium text-hrms-navy">{value}</dd>

    </div>

  )

}


