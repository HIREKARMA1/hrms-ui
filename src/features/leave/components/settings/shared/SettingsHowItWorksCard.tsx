/**
 * Collapsible intro card for Leave Settings (open first visit, remembered in localStorage).
 */

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { LEAVE_MOTION } from '../../shared/leaveUi'

const STORAGE_KEY = 'leave-settings-how-it-works-open'

function readInitialOpen() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return true
    return raw === '1'
  } catch {
    return true
  }
}

export function SettingsHowItWorksCard() {
  const [open, setOpen] = useState(readInitialOpen)

  function toggle() {
    setOpen((value) => {
      const next = !value
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return (
    <div className="rounded-xl border border-hrms-border bg-white">
      <button
        type="button"
        onClick={toggle}
        className={cn('flex w-full items-center justify-between gap-2 px-4 py-3 text-left', LEAVE_MOTION)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-hrms-navy">How these settings work</span>
        <ChevronDown className={cn('h-4 w-4 text-hrms-text-secondary', open && 'rotate-180', LEAVE_MOTION)} aria-hidden />
      </button>
      {open ? (
        <div className="space-y-2 border-t border-hrms-border px-4 py-3 text-sm text-hrms-text-secondary">
          <p>These rules apply to every employee.</p>
          <p>Changes apply to new requests. Leave that is already approved is not changed.</p>
          <p>Click Save settings to keep your changes.</p>
          <p className="text-xs text-hrms-text-muted">Sample values — confirm leave rules with your CA or labour-law advisor.</p>
        </div>
      ) : null}
    </div>
  )
}
