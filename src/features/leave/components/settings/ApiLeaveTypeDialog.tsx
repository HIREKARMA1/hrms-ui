/**
 * Create or edit a server leave type (POST / PATCH /leave-types).
 */

import { Tags } from 'lucide-react'

import type { LeaveTypeOption } from '../../api/leaveMappers'
import type { CreateLeaveTypeBody, UpdateLeaveTypeBody } from '../../api/leaveApi.types'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { LeaveTypeDialogFormBody } from './leaveTypeDialog/LeaveTypeDialogFormBody'
import { LeaveTypePreviewStrip } from './leaveTypeDialog/LeaveTypeDialogUi'
import { useApiLeaveTypeDialogState } from './leaveTypeDialog/useApiLeaveTypeDialogState'

export type { ApiLeaveTypeDialogMode } from './leaveTypeDialog/leaveTypeDialogForm'
import type { ApiLeaveTypeDialogMode } from './leaveTypeDialog/leaveTypeDialogForm'

type ApiLeaveTypeDialogProps = {
  open: boolean
  mode: ApiLeaveTypeDialogMode
  initial: LeaveTypeOption | null
  saveError?: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: {
    mode: ApiLeaveTypeDialogMode
    id?: string
    body: CreateLeaveTypeBody | UpdateLeaveTypeBody
  }) => void
  loading?: boolean
}

const SCROLL_BODY =
  'space-y-6 overscroll-contain [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-hrms-border/80'

export function ApiLeaveTypeDialog({
  open,
  mode,
  initial,
  saveError,
  onOpenChange,
  onSubmit,
  loading,
}: ApiLeaveTypeDialogProps) {
  const state = useApiLeaveTypeDialogState(open, mode, initial, onSubmit)

  const title = mode === 'create' ? 'Add leave type' : 'Edit leave type'
  const subtitle =
    mode === 'create'
      ? 'Define a catalog code and rules employees see when applying leave.'
      : 'Update how this type appears on requests and balances.'

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md" className="shadow-xl">
        <LeaveDialogCloseButton />
        <LeaveDialogHeader title={title} subtitle={subtitle} icon={Tags} />
        <LeaveDialogBody className={SCROLL_BODY}>
          {saveError ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
              {saveError}
            </p>
          ) : null}

          <LeaveTypePreviewStrip code={state.previewCode} name={state.previewName} />

          <LeaveTypeDialogFormBody
            mode={mode}
            initial={initial}
            form={state.form}
            loading={loading}
            codeErr={state.codeErr}
            nameErr={state.nameErr}
            maxError={state.maxError}
            touched={state.touched}
            onPatch={state.patch}
            onTouch={state.touch}
            onMaxErrorClear={() => state.setMaxError(null)}
          />
        </LeaveDialogBody>
        <LeaveDialogFooter className="bg-hrms-muted-bg/35">
          <LeaveDialogFooterActions
            primaryLabel={mode === 'create' ? 'Create leave type' : 'Save changes'}
            loading={loading}
            primaryDisabled={!state.canSave}
            onPrimary={state.handleSubmit}
          />
        </LeaveDialogFooter>
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}