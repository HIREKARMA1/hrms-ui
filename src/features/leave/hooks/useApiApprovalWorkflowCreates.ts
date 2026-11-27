import { useState } from 'react'

import {
  useCreateApprovalWorkflowMutation,
  useDeactivateApprovalWorkflowMutation,
  useUpdateApprovalWorkflowMutation,
} from '../api/leaveApprovalApi'
import type { CreateApprovalWorkflowBody, UpdateApprovalWorkflowBody } from '../types/api/leaveApprovalWorkflows.types'
import { formatApprovalWorkflowSaveError } from '../utils/formatApprovalWorkflowSaveError'
import type { ApiApprovalWorkflowDialogMode } from '../components/settings/ApiApprovalWorkflowDialog'

export function useApiApprovalWorkflowCreates() {
  const [createWorkflow] = useCreateApprovalWorkflowMutation()
  const [updateWorkflow] = useUpdateApprovalWorkflowMutation()
  const [deactivateWorkflow] = useDeactivateApprovalWorkflowMutation()

  const [dialog, setDialog] = useState<{ mode: ApiApprovalWorkflowDialogMode; id: string | null } | null>(null)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function openCreate() {
    setSaveError(null)
    setDialog({ mode: 'create', id: null })
  }

  function openEdit(id: string) {
    setSaveError(null)
    setDialog({ mode: 'edit', id })
  }

  function closeDialog() {
    setDialog(null)
    setSaveError(null)
  }

  async function submit(payload: {
    mode: ApiApprovalWorkflowDialogMode
    id?: string
    body: CreateApprovalWorkflowBody | UpdateApprovalWorkflowBody
  }): Promise<boolean> {
    setBusy(true)
    setSaveError(null)
    try {
      if (payload.mode === 'create') {
        await createWorkflow(payload.body as CreateApprovalWorkflowBody).unwrap()
      } else if (payload.id) {
        await updateWorkflow({ id: payload.id, body: payload.body }).unwrap()
      }
      closeDialog()
      return true
    } catch (error) {
      setSaveError(formatApprovalWorkflowSaveError(error))
      return false
    } finally {
      setBusy(false)
    }
  }

  async function confirmDeactivate(): Promise<boolean> {
    if (!deactivateId) return false
    setBusy(true)
    try {
      await deactivateWorkflow(deactivateId).unwrap()
      setDeactivateId(null)
      return true
    } catch (error) {
      setSaveError(formatApprovalWorkflowSaveError(error))
      return false
    } finally {
      setBusy(false)
    }
  }

  return {
    dialog,
    deactivateId,
    busy,
    saveError,
    openCreate,
    openEdit,
    closeDialog,
    openDeactivate: setDeactivateId,
    clearSaveError: () => setSaveError(null),
    submit,
    confirmDeactivate,
  }
}