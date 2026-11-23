/**
 * Labelled dialog field with optional error text linked via aria-describedby.
 */

import type { ReactNode } from 'react'

import { LEAVE_FIELD_LABEL } from './leaveUi'

type LeaveDialogFieldProps = {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  touched?: boolean
  children: ReactNode
}

export function LeaveDialogField({ label, htmlFor, required, error, touched, children }: LeaveDialogFieldProps) {
  const errorId = `${htmlFor}-error`
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className={LEAVE_FIELD_LABEL}>
        {label}
        {required ? <span className="text-hrms-danger"> *</span> : null}
      </label>
      <div aria-describedby={touched && error ? errorId : undefined}>{children}</div>
      {touched && error ? (
        <p id={errorId} className="text-xs text-hrms-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
