import { createContext } from 'react'

export type OfficeCalendarConfirmVariant = 'destructive' | 'default'

export type OfficeCalendarConfirmRequest = {
  title: string
  description: string
  confirmLabel?: string
  variant?: OfficeCalendarConfirmVariant
  /** `null` hides the extra body. Omit to use the default footnote for destructive confirms. */
  footnote?: string | null
}

export const OFFICE_CALENDAR_CONFIRM_DEFAULTS = {
  confirmLabel: 'Delete',
  variant: 'destructive' as const,
  destructiveFootnote:
    'This action uses mock data only and cannot be undone in the current preview.',
}

export type OfficeCalendarConfirmContextValue = {
  requestConfirm: (request: OfficeCalendarConfirmRequest) => Promise<boolean>
}

export const OfficeCalendarConfirmContext = createContext<OfficeCalendarConfirmContextValue | null>(
  null,
)