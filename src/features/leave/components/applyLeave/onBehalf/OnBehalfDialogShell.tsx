import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, UserRound, X } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type OnBehalfDialogShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  describedBy: string
  children: ReactNode
  footer: ReactNode
}

export function OnBehalfDialogShell({
  open,
  onOpenChange,
  describedBy,
  children,
  footer,
}: OnBehalfDialogShellProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(23,33,58,0.45)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={describedBy}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-40px)] w-[calc(100%-2rem)] max-w-[1020px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] bg-white font-[Inter,system-ui,sans-serif] shadow-[0_24px_64px_rgba(23,33,58,0.28)] focus:outline-none',
            'data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200',
          )}
        >
          <header className="flex shrink-0 items-start gap-3 border-b border-[#E2E6EF] px-6 py-5 pr-14 max-[480px]:px-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#5938DB]"
              aria-hidden
            >
              <UserRound className="h-[22px] w-[22px]" />
            </div>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-bold text-[#17213A]">Apply on behalf</Dialog.Title>
              <Dialog.Description id={describedBy} className="mt-0.5 text-[13px] text-[#667085]">
                Complete leave details for the selected employee.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-[10px] text-[#667085] transition-colors hover:bg-[#F3F4F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B5CF6]"
              type="button"
            >
              <X className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>

          {footer}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

type OnBehalfDialogFooterProps = {
  showReasonHint: boolean
  primaryLabel: string
  primaryDisabled: boolean
  loading?: boolean
  onPrimary: () => void
}

export function OnBehalfDialogFooterBar({
  showReasonHint,
  primaryLabel,
  primaryDisabled,
  loading,
  onPrimary,
}: OnBehalfDialogFooterProps) {
  return (
    <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-[#E2E6EF] bg-white px-6 py-4 max-[480px]:px-4">
      <div className="min-h-[1.25rem] flex-1">
        {showReasonHint ? (
          <p className="flex items-center gap-2 text-[12.5px] text-[#667085]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#EF4444]" aria-hidden />
            Reason is required.
          </p>
        ) : null}
      </div>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        <Dialog.Close asChild>
          <button
            type="button"
            disabled={loading}
            className="h-[42px] rounded-[10px] bg-[#F0EDFF] px-5 text-sm font-semibold text-[#5938DB] transition-colors hover:bg-[#E8E2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B5CF6] disabled:opacity-60"
          >
            Cancel
          </button>
        </Dialog.Close>
        <button
          type="button"
          disabled={primaryDisabled || loading}
          onClick={onPrimary}
          className={cn(
            'inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B5CF6]',
            primaryDisabled || loading
              ? 'cursor-not-allowed bg-[#B7A8F3]'
              : 'bg-[#5938DB] hover:bg-[#7055EB]',
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {loading ? 'Please wait…' : primaryLabel}
        </button>
      </div>
    </footer>
  )
}