import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { OfficeCalendarConfirmDialog } from '../components/OfficeCalendarConfirmDialog'
import {
  OFFICE_CALENDAR_CONFIRM_DEFAULTS,
  OfficeCalendarConfirmContext,
  type OfficeCalendarConfirmRequest,
} from './officeCalendarConfirmContext'

type PendingConfirm = OfficeCalendarConfirmRequest & {
  resolve: (value: boolean) => void
}

export function OfficeCalendarConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const requestConfirm = useCallback((request: OfficeCalendarConfirmRequest) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...request, resolve })
    })
  }, [])

  const value = useMemo(() => ({ requestConfirm }), [requestConfirm])

  function close(confirmed: boolean) {
    pending?.resolve(confirmed)
    setPending(null)
  }

  return (
    <OfficeCalendarConfirmContext.Provider value={value}>
      {children}
      <OfficeCalendarConfirmDialog
        open={Boolean(pending)}
        title={pending?.title ?? ''}
        description={pending?.description ?? ''}
        confirmLabel={pending?.confirmLabel ?? OFFICE_CALENDAR_CONFIRM_DEFAULTS.confirmLabel}
        variant={pending?.variant ?? OFFICE_CALENDAR_CONFIRM_DEFAULTS.variant}
        footnote={pending?.footnote}
        onOpenChange={(open) => {
          if (!open) close(false)
        }}
        onConfirm={() => close(true)}
      />
    </OfficeCalendarConfirmContext.Provider>
  )
}