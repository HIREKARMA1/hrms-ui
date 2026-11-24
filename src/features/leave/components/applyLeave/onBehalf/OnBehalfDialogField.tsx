import type { ReactNode } from 'react'

import { obDanger, obLabelClass } from './onBehalfDialogUi'

type OnBehalfDialogFieldProps = {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  touched?: boolean
  children: ReactNode
}

export function OnBehalfDialogField({
  label,
  htmlFor,
  required,
  error,
  touched,
  children,
}: OnBehalfDialogFieldProps) {
  const errorId = `${htmlFor}-error`
  return (
    <div>
      <label htmlFor={htmlFor} className={obLabelClass}>
        {label}
        {required ? <span style={{ color: obDanger }}> *</span> : null}
      </label>
      <div aria-describedby={touched && error ? errorId : undefined}>{children}</div>
      {touched && error ? (
        <p id={errorId} className="mt-1 text-xs" style={{ color: obDanger }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}