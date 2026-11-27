import { useState } from 'react'

import {
  useCreateAccrualPolicyMutation,
  useCreateCarryForwardPolicyMutation,
} from '../api/leaveApi'
import type { CreateAccrualPolicyBody, CreateCarryForwardPolicyBody } from '../api/leaveApi.types'
import { formatLeavePolicySaveError } from '../utils/formatLeavePolicySaveError'
import { useLeaveToast } from './useLeaveToast'

export type PolicyCreateDialog = 'accrual' | 'carryForward'

export function useApiAccrualPolicyCreates() {
  const { showToast } = useLeaveToast()
  const [createAccrualPolicy] = useCreateAccrualPolicyMutation()
  const [createCarryForwardPolicy] = useCreateCarryForwardPolicyMutation()

  const [createDialog, setCreateDialog] = useState<PolicyCreateDialog | null>(null)
  const [policyBusy, setPolicyBusy] = useState(false)
  const [policySaveError, setPolicySaveError] = useState<string | null>(null)

  function openCreate(kind: PolicyCreateDialog) {
    setPolicySaveError(null)
    setCreateDialog(kind)
  }

  function closeCreate() {
    if (!policyBusy) setCreateDialog(null)
  }

  async function submitAccrualPolicy(body: CreateAccrualPolicyBody) {
    setPolicyBusy(true)
    setPolicySaveError(null)
    try {
      await createAccrualPolicy(body).unwrap()
      showToast('Accrual policy created.')
      setCreateDialog(null)
    } catch (error) {
      const message = formatLeavePolicySaveError(error)
      setPolicySaveError(message)
      showToast('Could not create the accrual policy. See the message in the dialog.')
    } finally {
      setPolicyBusy(false)
    }
  }

  async function submitCarryForwardPolicy(body: CreateCarryForwardPolicyBody) {
    setPolicyBusy(true)
    setPolicySaveError(null)
    try {
      await createCarryForwardPolicy(body).unwrap()
      showToast('Carry-forward policy created.')
      setCreateDialog(null)
    } catch (error) {
      const message = formatLeavePolicySaveError(error)
      setPolicySaveError(message)
      showToast('Could not create the carry-forward policy. See the message in the dialog.')
    } finally {
      setPolicyBusy(false)
    }
  }

  return {
    createDialog,
    policyBusy,
    policySaveError,
    openCreate,
    closeCreate,
    submitAccrualPolicy,
    submitCarryForwardPolicy,
  }
}