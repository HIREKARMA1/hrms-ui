/**
 * Draft leave settings with section validation for the redesigned settings tab.
 */

import { useCallback, useEffect, useState } from 'react'

import type { LeaveSettingsSectionId } from '../constants/leaveSettingsSections'
import type { LeaveSettings } from '../types/leaveSettings'
import { saveSettingsDraft } from '../services/leaveService'
import { createDefaultLeaveSettings } from '../services/companyDefaults'
import { countDirtySections } from '../utils/leaveSettingsSectionDiff'
import { validateLeaveSettings, type SettingsValidationIssue } from '../utils/validateLeaveSettings'
import { useLeave } from './useLeave'

export function useLeaveSettingsForm() {
  const { snapshot } = useLeave()
  const [draft, setDraft] = useState<LeaveSettings>(createDefaultLeaveSettings())
  const [saved, setSaved] = useState<LeaveSettings>(createDefaultLeaveSettings())
  const [issues, setIssues] = useState<SettingsValidationIssue[]>([])

  useEffect(() => {
    if (!snapshot?.settings) return
    const handle = window.setTimeout(() => {
      setDraft(structuredClone(snapshot.settings))
      setSaved(structuredClone(snapshot.settings))
    }, 0)
    return () => window.clearTimeout(handle)
  }, [snapshot?.settings])

  const dirtyCount = countDirtySections(draft, saved)
  const isDirty = dirtyCount > 0

  const discard = useCallback(() => {
    setDraft(structuredClone(saved))
    setIssues([])
  }, [saved])

  const handleSave = useCallback(
    async (userName: string): Promise<{ ok: boolean; firstErrorSection?: LeaveSettingsSectionId }> => {
      const nextIssues = validateLeaveSettings(draft)
      setIssues(nextIssues)
      if (nextIssues.length > 0) {
        return { ok: false, firstErrorSection: nextIssues[0].section }
      }
      await saveSettingsDraft(draft, userName)
      setSaved(structuredClone(draft))
      setIssues([])
      return { ok: true }
    },
    [draft],
  )

  return { draft, setDraft, saved, isDirty, dirtyCount, issues, handleSave, discard }
}
