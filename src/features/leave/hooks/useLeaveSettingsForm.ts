/**
 * Draft leave settings with dirty tracking for Leave Settings tab save bar.
 * Persists via leaveService.saveSettingsDraft on save.
 */

import { useCallback, useEffect, useState } from 'react'

import type { LeaveSettings } from '../types/leaveSettings'
import { saveSettingsDraft } from '../services/leaveService'
import { createDefaultLeaveSettings } from '../services/companyDefaults'
// Facade re-exports defaults; form initializes before snapshot loads.
import { useLeave } from './useLeave'

export function useLeaveSettingsForm() {
  const { snapshot } = useLeave()
  const [draft, setDraft] = useState<LeaveSettings>(createDefaultLeaveSettings())
  const [saved, setSaved] = useState<LeaveSettings>(createDefaultLeaveSettings())
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!snapshot?.settings) {
      return
    }
    const handle = window.setTimeout(() => {
      setDraft(structuredClone(snapshot.settings))
      setSaved(structuredClone(snapshot.settings))
    }, 0)
    return () => window.clearTimeout(handle)
  }, [snapshot?.settings])

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const discard = useCallback(() => {
    setDraft(structuredClone(saved))
    setErrors([])
  }, [saved])

  const handleSave = useCallback(async () => {
    if (draft.encashmentRules.minimumBalanceDays < 0) {
      setErrors(['Encashment minimum balance must be zero or more.'])
      return false
    }
    await saveSettingsDraft(draft)
    setSaved(structuredClone(draft))
    setErrors([])
    return true
  }, [draft])

  return { draft, setDraft, isDirty, fieldErrors: errors, handleSave, discard }
}
