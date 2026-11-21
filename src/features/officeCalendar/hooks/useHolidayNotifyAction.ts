/**
 * POST /calendar/holidays/{id}/notify for a holiday table row.
 */

import { useCallback, useRef, useState } from 'react'

import { useNotifyHolidayMutation } from '@/features/leave/api/holidayCalendarApi'
import {
  isOfficeHolidayTypeNotifiable,
  OFFICE_HOLIDAY_NOTIFY_INELIGIBLE_HINT,
} from '@/features/leave/utils/holidayNotifyEligibility'
import { getApiErrorMessage } from '@/services/api/errors'

import type { OfficeHolidayType } from '../types/officeCalendar'

import { formatOfficeDate } from '../utils/formatOfficeCalendarDate'
import { useCanNotifyHoliday } from './useCanNotifyHoliday'
import { useOfficeCalendarConfirm } from './useOfficeCalendarConfirm'
import { useOfficeCalendarToast } from './useOfficeCalendarToast'

function isAlreadyNotifiedError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('status' in error)) return false
  return error.status === 409
}

export function useHolidayNotifyAction() {
  const canNotify = useCanNotifyHoliday()
  const { showToast } = useOfficeCalendarToast()
  const { requestConfirm } = useOfficeCalendarConfirm()
  const [notify] = useNotifyHolidayMutation()
  const [notifyingHolidayId, setNotifyingHolidayId] = useState<string | null>(null)
  const notifyBusyRef = useRef(false)

  const isNotifyLoading = useCallback(
    (id: string) => notifyingHolidayId === id,
    [notifyingHolidayId],
  )

  const handleNotify = useCallback(
    async (id: string, holidayName: string, holidayDate: string, holidayType: OfficeHolidayType) => {
      if (!canNotify) {
        showToast('You need holidays:notify to send holiday notifications.')
        return
      }
      if (!isOfficeHolidayTypeNotifiable(holidayType)) {
        showToast(OFFICE_HOLIDAY_NOTIFY_INELIGIBLE_HINT)
        return
      }
      if (notifyBusyRef.current || notifyingHolidayId !== null) return
      notifyBusyRef.current = true

      try {
        const dateLabel = formatOfficeDate(holidayDate)
        const confirmed = await requestConfirm({
          title: 'Notify employees?',
          description: `Send an email to all active employees about “${holidayName}” on ${dateLabel}?`,
          confirmLabel: 'Send notification',
          variant: 'default',
          footnote: null,
        })
        if (!confirmed) return

        const send = async (resend: boolean) => {
          const result = await notify({ id, resend: resend || undefined }).unwrap()
          if (result.status === 'PARTIAL') {
            showToast(`Notification partially sent for “${holidayName}”.`)
          } else if (result.status === 'FAILED') {
            showToast(`Notification failed for “${holidayName}”.`)
          } else {
            showToast(`Employees notified about “${holidayName}”.`)
          }
        }

        setNotifyingHolidayId(id)
        try {
          try {
            await send(false)
          } catch (error) {
            if (isAlreadyNotifiedError(error)) {
              const ok = await requestConfirm({
                title: 'Send again?',
                description: `Employees were already notified about “${holidayName}” on ${dateLabel}. Send again?`,
                confirmLabel: 'Send again',
                variant: 'default',
                footnote: null,
              })
              if (!ok) return
              try {
                await send(true)
              } catch (retryError) {
                showToast(getApiErrorMessage(retryError, 'Could not resend holiday notification.'))
              }
              return
            }
            showToast(getApiErrorMessage(error, 'Could not send holiday notification.'))
          }
        } finally {
          setNotifyingHolidayId(null)
        }
      } finally {
        notifyBusyRef.current = false
      }
    },
    [canNotify, notify, notifyingHolidayId, requestConfirm, showToast],
  )

  return { canNotify, isNotifyLoading, handleNotify }
}