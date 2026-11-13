/**
 * Labelled settings field with helper text and optional error (aria-describedby).
 */

import type { ReactNode } from 'react'

import { SettingsInfoLabel } from './SettingsInfoLabel'

type SettingsFieldProps = {
  label: string
  helper?: string
  htmlFor?: string
  error?: string
  tip?: string
  children: ReactNode
}

export function SettingsField({ label, helper, htmlFor, error, tip, children }: SettingsFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-err` : undefined
  return (
    <div className="space-y-1">
      <SettingsInfoLabel htmlFor={htmlFor} label={label} tip={tip} />
      {helper ? <p className="text-sm text-hrms-text-secondary">{helper}</p> : null}
      <div aria-describedby={error ? errorId : undefined}>{children}</div>
      {error ? (
        <p id={errorId} className="text-xs text-hrms-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
