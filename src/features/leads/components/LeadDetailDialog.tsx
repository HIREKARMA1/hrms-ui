/**
 * Lead detail with notes, activity history, and attachments.
 */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useLeads } from '../hooks/useLeads'
import type { Lead } from '../types/lead'
import { formatLeadDate } from '../utils/formatLeadDate'
import { LeadPriorityPill } from './LeadPriorityPill'
import { LeadStatusPill } from './LeadStatusPill'
import { cn } from '@/lib/utils'

import {
  LEADS_DIALOG_HEADER_BAND,
  LEADS_DIALOG_SHELL,
  LEADS_DIALOG_TAB_ACTIVE,
  LEADS_DIALOG_TAB_IDLE,
} from './shared/leadsUi'
import {
  PayrollDialogBody,
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogFooter,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '@/features/payroll/components/shared/PayrollDialog'

type LeadDetailDialogProps = {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  canEdit?: boolean
  canDelete?: boolean
}

const DETAIL_TABS = ['Details', 'Notes', 'Activity', 'Attachments'] as const
type DetailTab = (typeof DETAIL_TABS)[number]

export function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: LeadDetailDialogProps) {
  const { addNote, addAttachment } = useLeads()
  const [tab, setTab] = useState<DetailTab>('Details')
  const [noteText, setNoteText] = useState('')
  const [fileName, setFileName] = useState('')

  if (!lead) return null

  async function saveNote() {
    if (!noteText.trim()) return
    await addNote(lead!.id, noteText.trim())
    setNoteText('')
  }

  async function saveAttachment() {
    if (!fileName.trim()) return
    await addAttachment(lead!.id, fileName.trim())
    setFileName('')
  }

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="md"
          className={cn('flex max-h-[min(90vh,720px)] flex-col p-0', LEADS_DIALOG_SHELL)}
        >
          <div className={LEADS_DIALOG_HEADER_BAND}>
            <PayrollDialogHeader
              title={lead.leadName}
              description={`${lead.id} · ${lead.companyName}`}
            >
              <div className="mt-2 flex flex-wrap gap-2">
                <LeadStatusPill status={lead.status} />
                <LeadPriorityPill priority={lead.priority} />
              </div>
            </PayrollDialogHeader>
          </div>
          <div className="flex shrink-0 gap-2 border-b border-hrms-border bg-white px-6 py-3">
            {DETAIL_TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={tab === item ? LEADS_DIALOG_TAB_ACTIVE : LEADS_DIALOG_TAB_IDLE}
              >
                {item}
              </button>
            ))}
          </div>
          <PayrollDialogBody className="space-y-4 text-sm">
            {tab === 'Details' ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailField label="Contact" value={lead.contactPerson} />
                <DetailField label="Email" value={lead.email} />
                <DetailField label="Phone" value={lead.phone} />
                <DetailField label="Website" value={lead.website || '—'} />
                <DetailField label="Industry" value={lead.industry} />
                <DetailField label="Company size" value={lead.companySize} />
                <DetailField label="Source" value={lead.source} />
                <DetailField label="Category" value={lead.category} />
                <DetailField label="Owner" value={lead.assignedEmployeeName ?? 'Unassigned'} />
                <DetailField label="Updated" value={formatLeadDate(lead.updatedAt)} />
                <div className="sm:col-span-2">
                  <DetailField label="Description" value={lead.description || '—'} />
                </div>
                <div className="sm:col-span-2">
                  <DetailField label="Requirements" value={lead.requirements || '—'} />
                </div>
              </dl>
            ) : null}
            {tab === 'Notes' ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={noteText}
                    placeholder="Add a note or comment…"
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <Button type="button" onClick={() => void saveNote()}>
                    Add
                  </Button>
                </div>
                <ul className="space-y-2">
                  {lead.notes.length === 0 ? (
                    <li className="text-hrms-text-muted">No notes yet.</li>
                  ) : (
                    lead.notes.map((note) => (
                      <li key={note.id} className="rounded-lg border border-hrms-border p-3">
                        <p className="text-hrms-navy">{note.text}</p>
                        <p className="mt-1 text-xs text-hrms-text-muted">
                          {note.authorName} · {formatLeadDate(note.createdAt)}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : null}
            {tab === 'Activity' ? (
              <ol className="space-y-2 border-l border-hrms-border pl-4">
                {lead.activities.map((item) => (
                  <li key={item.id} className="text-hrms-text-secondary">
                    <span className="font-medium text-hrms-navy">{item.summary}</span>
                    <span className="block text-xs text-hrms-text-muted">
                      {item.createdBy} · {formatLeadDate(item.createdAt)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
            {tab === 'Attachments' ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="attach-name">File name (demo upload)</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      id="attach-name"
                      value={fileName}
                      placeholder="proposal-v2.pdf"
                      onChange={(e) => setFileName(e.target.value)}
                    />
                    <Button type="button" onClick={() => void saveAttachment()}>
                      Upload
                    </Button>
                  </div>
                </div>
                <ul className="space-y-2">
                  {lead.attachments.length === 0 ? (
                    <li className="text-hrms-text-muted">No attachments.</li>
                  ) : (
                    lead.attachments.map((file) => (
                      <li
                        key={file.id}
                        className="flex justify-between rounded-lg border border-hrms-border px-3 py-2"
                      >
                        <span className="font-medium text-hrms-navy">{file.fileName}</span>
                        <span className="text-xs text-hrms-text-muted">
                          {file.uploadedBy} · {formatLeadDate(file.uploadedAt)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : null}
          </PayrollDialogBody>
          <PayrollDialogFooter>
            {canEdit || canDelete ? (
              <div className="flex flex-wrap justify-between gap-2">
                {canDelete ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-hrms-danger"
                    onClick={onDelete}
                  >
                    Delete lead
                  </Button>
                ) : (
                  <span />
                )}
                {canEdit ? (
                  <Button type="button" onClick={onEdit}>
                    Edit lead
                  </Button>
                ) : null}
              </div>
            ) : null}
          </PayrollDialogFooter>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-hrms-text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-hrms-navy">{value}</dd>
    </div>
  )
}