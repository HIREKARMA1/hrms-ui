import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import {
  closeAdminSupportRequest,
  replyToAdminSupportRequest,
} from '../services/adminSupportStore'
import type { AdminSupportRequest } from '../types/adminSupportRequest'

import { AdminRequestIssueBadges } from './AdminRequestIssueBadges'
import { AdminRequestStatusBadge } from './AdminRequestStatusBadge'

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

type AdminRequestReplyDialogProps = {
  request: AdminSupportRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReplied?: (email: string) => void
}

export function AdminRequestReplyDialog({
  request,
  open,
  onOpenChange,
  onReplied,
}: AdminRequestReplyDialogProps) {
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setReplyText('')
      setReplyError(null)
    }
  }, [open, request?.id])

  if (!request) return null

  const summary =
    request.otherDetail?.trim() ||
    request.note?.trim() ||
    '—'

  const handleSend = () => {
    if (!replyText.trim()) {
      setReplyError('Enter a reply message.')
      return
    }
    const updated = replyToAdminSupportRequest(request.id, replyText, 'HR Support')
    if (!updated) {
      setReplyError('Could not send reply.')
      return
    }
    onReplied?.(request.email)
    onOpenChange(false)
  }

  const handleCloseRequest = () => {
    closeAdminSupportRequest(request.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-lg">{request.id}</DialogTitle>
            <AdminRequestStatusBadge status={request.status} />
          </div>
          <DialogDescription>
            Submitted {formatWhen(request.createdAt)} · {request.email}
            {request.employeeId ? ` · ${request.employeeId}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Issue types
            </p>
            <AdminRequestIssueBadges issues={request.issues} className="mt-2" />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Employee message
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{summary}</p>
            {request.note && request.otherDetail && request.note !== request.otherDetail ? (
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Note: </span>
                {request.note}
              </p>
            ) : null}
          </section>

          {request.replies.length > 0 ? (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Conversation
              </p>
              {request.replies.map((reply) => (
                <article
                  key={reply.id}
                  className="rounded-xl border border-brand-100 bg-brand-50/40 p-3"
                >
                  <p className="text-xs font-semibold text-brand-800">
                    {reply.sentBy} · {formatWhen(reply.sentAt)}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                    {reply.message}
                  </p>
                </article>
              ))}
            </section>
          ) : null}

          {request.status !== 'closed' ? (
            <section className="space-y-2">
              <label htmlFor="hr-reply" className="text-sm font-medium text-slate-900">
                Reply to employee
              </label>
              <Textarea
                id="hr-reply"
                rows={4}
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value)
                  if (replyError) setReplyError(null)
                }}
                placeholder="Your message will be emailed to the employee (demo: stored only)."
                className={cn(replyError && 'border-red-400')}
              />
              {replyError ? <p className="text-xs text-red-500">{replyError}</p> : null}
            </section>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {request.status !== 'closed' ? (
            <>
              <Button type="button" variant="outline" onClick={handleCloseRequest}>
                Mark closed
              </Button>
              <Button type="button" onClick={handleSend}>
                Send reply
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}