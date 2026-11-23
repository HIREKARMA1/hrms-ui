/**
 * Dialog + sync UI state for Attendance → Biometric settings card.
 */
import { useState } from 'react'

import type { BiometricDevice } from '@/features/biometric/types/api/biometricDevices.types'
import type { BiometricSyncResult } from '@/features/biometric/types/api/biometricSync.types'

import {
  emptyBiometricDeviceForm,
  formFromDevice,
  type BiometricDeviceFormState,
} from '../components/biometric/BiometricDeviceFormDialog'
import type { BiometricSyncUiOutcome } from './useAttendanceBiometricSettings'

export function useBiometricSettingsUiState(
  runSync: (deviceCode?: string) => Promise<BiometricSyncUiOutcome>,
  submitRegister: (draft: BiometricDeviceFormState) => Promise<boolean>,
  submitUpdate: (device: BiometricDevice, draft: BiometricDeviceFormState) => Promise<boolean>,
) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'register' | 'edit'>('register')
  const [editTarget, setEditTarget] = useState<BiometricDevice | null>(null)
  const [draft, setDraft] = useState(emptyBiometricDeviceForm())
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [syncScopeLabel, setSyncScopeLabel] = useState('All registered devices')
  const [syncResult, setSyncResult] = useState<BiometricSyncResult | null>(null)
  const [syncError, setSyncError] = useState<string | undefined>()
  const [syncingDeviceCode, setSyncingDeviceCode] = useState<string | null>(null)

  async function openSyncReport(deviceCode?: string) {
    setSyncingDeviceCode(deviceCode ?? null)
    const outcome = await runSync(deviceCode)
    setSyncingDeviceCode(null)
    setSyncScopeLabel(outcome.scopeLabel)
    if (outcome.ok) {
      setSyncResult(outcome.result)
      setSyncError(undefined)
    } else {
      setSyncResult(null)
      setSyncError(outcome.message)
    }
    setSyncDialogOpen(true)
  }

  function openRegister(presetCode?: string) {
    setDialogMode('register')
    setEditTarget(null)
    setDraft({ ...emptyBiometricDeviceForm(), deviceCode: presetCode ?? '' })
    setDialogOpen(true)
  }

  function openEdit(device: BiometricDevice) {
    setDialogMode('edit')
    setEditTarget(device)
    setDraft(formFromDevice(device))
    setDialogOpen(true)
  }

  async function handleSubmit() {
    const ok =
      dialogMode === 'register'
        ? await submitRegister(draft)
        : editTarget
          ? await submitUpdate(editTarget, draft)
          : false
    if (ok) setDialogOpen(false)
  }

  return {
    dialogOpen,
    setDialogOpen,
    dialogMode,
    draft,
    setDraft,
    editTarget,
    syncDialogOpen,
    setSyncDialogOpen,
    syncScopeLabel,
    syncResult,
    syncError,
    syncingDeviceCode,
    openSyncReport,
    openRegister,
    openEdit,
    handleSubmit,
  }
}