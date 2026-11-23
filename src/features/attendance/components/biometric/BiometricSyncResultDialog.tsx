import * as Dialog from '@radix-ui/react-dialog'
import { CheckCircle2, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  BiometricDeviceSyncResult,
  BiometricSyncResult,
} from '@/features/biometric/types/api/biometricSync.types'

type BiometricSyncResultDialogProps = {
  open: boolean
  scopeLabel: string
  result: BiometricSyncResult | null
  errorMessage?: string
  onOpenChange: (open: boolean) => void
}

function countStat(rows: BiometricDeviceSyncResult[], key: 'fetched' | 'inserted' | 'skipped') {
  return rows.reduce((sum, row) => sum + (row[key] ?? 0), 0)
}

export function BiometricSyncResultDialog({
  open,
  scopeLabel,
  result,
  errorMessage,
  onOpenChange,
}: BiometricSyncResultDialogProps) {
  const rows = result?.devices ?? []
  const allOk = result ? result.ok && rows.every((row) => row.ok) : false
  const title = errorMessage && !result ? 'Sync failed' : allOk ? 'Sync completed' : 'Sync finished with issues'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[min(88vh,640px)] w-[min(96vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border-soft bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-navy">{title}</Dialog.Title>
          <p className="mt-1 text-sm text-text-secondary">Scope: {scopeLabel}</p>

          {errorMessage && !rows.length ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          ) : null}

          {rows.length ? (
            <>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">Devices: {rows.length}</Badge>
                <Badge variant="secondary">Fetched: {countStat(rows, 'fetched')}</Badge>
                <Badge variant="secondary">Inserted: {countStat(rows, 'inserted')}</Badge>
                <Badge variant="secondary">Skipped: {countStat(rows, 'skipped')}</Badge>
              </div>
              <ul className="mt-4 space-y-3">
                {rows.map((row) => (
                  <li
                    key={row.deviceCode}
                    className="rounded-lg border border-border-soft bg-app-bg p-3 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      {row.ok ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-medium text-navy">{row.deviceCode}</p>
                        <p className="mt-1 text-text-secondary">
                          Fetched {row.fetched ?? 0} · Inserted {row.inserted ?? 0} · Skipped{' '}
                          {row.skipped ?? 0}
                        </p>
                        {row.message ? <p className="mt-1 text-red-600">{row.message}</p> : null}
                        {row.lastSyncCursor ? (
                          <p className="mt-1 text-xs text-text-secondary">Cursor: {row.lastSyncCursor}</p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : result && !errorMessage ? (
            <p className="mt-4 text-sm text-text-secondary">No device rows returned from the server.</p>
          ) : null}

          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <Button type="button">Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}