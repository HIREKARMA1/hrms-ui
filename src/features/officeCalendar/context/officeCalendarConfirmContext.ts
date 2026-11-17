import { createContext } from 'react'

export type OfficeCalendarConfirmRequest = {
  title: string
  description: string
}

export type OfficeCalendarConfirmContextValue = {
  requestConfirm: (request: OfficeCalendarConfirmRequest) => Promise<boolean>
}

export const OfficeCalendarConfirmContext = createContext<OfficeCalendarConfirmContextValue | null>(
  null,
)