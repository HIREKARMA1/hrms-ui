/**
 * Warns before in-app navigation away from Payroll Settings (BrowserRouter-safe; no useBlocker).
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { isPayrollSettingsPath } from '../utils/isPayrollSettingsPath'
import { PAYROLL_SETTINGS_LEAVE_CONFIRM } from './payrollSettingsUnsavedBridge'

function isInAppLink(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false
  return !/^https?:\/\//i.test(href)
}

function pathnameFromHref(href: string) {
  return new URL(href, window.location.origin).pathname
}

export function usePayrollSettingsLeaveBlocker(isDirty: boolean) {
  const location = useLocation()

  useEffect(() => {
    if (!isDirty || !isPayrollSettingsPath(location.pathname)) return

    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      const anchor = (event.target as Element | null)?.closest('a[href]')
      if (!anchor || !(anchor instanceof HTMLAnchorElement) || !isInAppLink(anchor)) return

      const nextPath = pathnameFromHref(anchor.getAttribute('href')!)
      if (nextPath === location.pathname) return
      if (!window.confirm(PAYROLL_SETTINGS_LEAVE_CONFIRM)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    document.addEventListener('click', onClickCapture, true)
    return () => document.removeEventListener('click', onClickCapture, true)
  }, [isDirty, location.pathname])
}