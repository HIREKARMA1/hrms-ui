import { useState } from 'react'

import { useCreateEncashmentPolicyMutation } from '../api/leaveEncashmentsApi'
import type { CreateEncashmentPolicyBody } from '../api/leaveApi.types'
import { formatLeavePolicySaveError } from '../utils/formatLeavePolicySaveError'
import { useLeaveToast } from './useLeaveToast'

export function useApiEncashmentPolicyCreates() {
  const { showToast } = useLeaveToast()
  const [createPolicy] = useCreateEncashmentPolicyMutation()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function openCreate() {
    setSaveError(null)
    setOpen(true)
  }

  function closeCreate() {
    if (!busy) setOpen(false)
  }

  async function submitPolicy(body: CreateEncashmentPolicyBody) {
    setBusy(true)
    setSaveError(null)
    try {
      await createPolicy(body).unwrap()
      showToast('Encashment policy created.')
      setOpen(false)
    } catch (error) {
      const message = formatLeavePolicySaveError(error)
      setSaveError(message)
    } finally {
      setBusy(false)
    }
  }

  function clearSaveError() {
    setSaveError(null)
  }

  return { open, busy, saveError, openCreate, closeCreate, clearSaveError, submitPolicy }
}