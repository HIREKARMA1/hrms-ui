/**
 * Encashment request detail for HR (GET /leave-encashments/{id} while open).
 */

import * as Dialog from '@radix-ui/react-dialog'
import { BadgeIndianRupee } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetEncashmentByIdQuery } from '../../api/leaveEncashmentsApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import type { HrEncashmentRequestRow } from '../../types/api/leaveEncashmentList.types'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'

type EncashmentRequestDetailDialogProps = {
  open: boolean
  row: HrEncashmentRequestRow | null
  employeeName: string
  onOpenChange: (open: boolean) => void
  useLiveApi?: boolean
}

export function EncashmentRequestDetailDialog({
  open,
  row,
  employeeName,
  onOpenChange,
  useLiveApi = false,
}: EncashmentRequestDetailDialogProps) {
  const canFetch = useShouldFetchLeaveList()
  const shouldFetchDetail = Boolean(open && useLiveApi && canFetch && row?.id)
  const {
    data: liveRow,
    isError: detailIsError,
    error: detailError,
    isFetching: detailFetching,
  } = useGetEncashmentByIdQuery(row?.id ?? '', { skip: !shouldFetchDetail })

  const displayRow: HrEncashmentRequestRow | null =
    shouldFetchDetail && liveRow && !detailIsError
      ? {
          ...liveRow,
          employeeDisplayName:
            liveRow.employeeDisplayName ?? row?.employeeDisplayName ?? employeeName,
        }
      : row

  if (!displayRow) return null

  const detailErrorMessage =
    shouldFetchDetail && detailIsError
      ? getApiErrorMessage(detailError, 'Could not load full details. Showing list data.')
      : null

  const title = displayRow.employeeDisplayName ?? employeeName
  const subtitle = `Encashment · ${displayRow.days} day${displayRow.days === 1 ? '' : 's'} · Ref ${displayRow.id}`

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md">
        <LeaveDialogHeader title={title} subtitle={subtitle} icon={BadgeIndianRupee}>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <LeaveTypeChip code={displayRow.leaveTypeCode} />
            <LeaveStatusPill status={displayRow.status} />
          </div>
        </LeaveDialogHeader>
        <LeaveDialogBody className="space-y-4">
          {detailErrorMessage ? (
            <p
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
              role="alert"
            >
              {detailErrorMessage}
            </p>
          ) : null}
          {detailFetching && shouldFetchDetail ? (
            <p className="text-xs text-hrms-text-muted">Loading encashment details…</p>
          ) : null}
          <section className="rounded-xl border border-hrms-border bg-hrms-muted-bg/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-hrms-text-muted">
              Summary
            </h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
              <DetailFact label="Employee ID" value={displayRow.employeeId || '—'} />
              <DetailFact label="Leave type" value={displayRow.leaveTypeCode} />
              <DetailFact label="Days to encash" value={String(displayRow.days)} />
              <DetailFact label="Requested on" value={formatDate(displayRow.appliedOn)} />
              {displayRow.approvedOn ? (
                <DetailFact label="Approved on" value={formatDate(displayRow.approvedOn)} />
              ) : null}
              <DetailFact label="Status" value={displayRow.status} />
            </dl>
          </section>
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <Dialog.Close asChild>
            <Button type="button" variant="outline" className={LEAVE_SECONDARY_BUTTON}>
              Close
            </Button>
          </Dialog.Close>
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}

function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-hrms-text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-hrms-navy">{value}</dd>
    </div>
  )
}