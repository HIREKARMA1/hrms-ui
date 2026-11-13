import { Eye, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Feature } from '@/features/rbac/components/Feature'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

import { MockDataBanner, OfferStatusBadge } from '../components'
import { departments } from '../mocks/recruitmentMocks'
import { listCandidates, listOffers } from '../services/recruitmentService'
import type { EmploymentType, Offer, OfferStatus } from '../types/recruitment'

type OfferForm = {
  candidateId: string
  jobTitle: string
  offeredDesignation: string
  department: string
  offeredSalary: string
  joiningDate: string
  offerExpiryDate: string
  employmentType: EmploymentType
  status: OfferStatus
}

const emptyForm: OfferForm = {
  candidateId: '',
  jobTitle: '',
  offeredDesignation: '',
  department: 'Engineering',
  offeredSalary: '',
  joiningDate: '',
  offerExpiryDate: '',
  employmentType: 'Full-time',
  status: 'Draft',
}

const offerStatuses: OfferStatus[] = [
  'Draft',
  'Pending Approval',
  'Released',
  'Accepted',
  'Rejected',
  'Expired',
]

export function OffersPage() {
  const [offers, setOffers] = useState(() => listOffers())
  const [candidates] = useState(() => listCandidates())
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [formOpen, setFormOpen] = useState(false)
  const [preview, setPreview] = useState<Offer | null>(null)
  const [form, setForm] = useState<OfferForm>(emptyForm)
  const [actionNote, setActionNote] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return offers
    return offers.filter((o) => o.status === statusFilter)
  }, [offers, statusFilter])

  const pending = offers.filter((o) =>
    ['Draft', 'Pending Approval', 'Released'].includes(o.status),
  )

  const openCreate = () => {
    const candidate = candidates.find((c) => c.stage === 'Selected') ?? candidates[0]
    setForm({
      ...emptyForm,
      candidateId: candidate?.id ?? '',
      jobTitle: candidate?.appliedJobTitle ?? '',
      offeredDesignation: 'Senior Engineer',
    })
    setFormOpen(true)
  }

  const saveOffer = () => {
    const candidate = candidates.find((c) => c.id === form.candidateId)
    if (!candidate || !form.offeredSalary.trim()) return
    setOffers((prev) => [
      {
        id: `OFF-${500 + prev.length + 1}`,
        candidateId: candidate.id,
        candidateName: candidate.fullName,
        jobTitle: form.jobTitle.trim() || candidate.appliedJobTitle,
        offeredDesignation: form.offeredDesignation.trim(),
        department: form.department,
        offeredSalary: form.offeredSalary.trim(),
        joiningDate: form.joiningDate,
        offerExpiryDate: form.offerExpiryDate,
        employmentType: form.employmentType,
        status: form.status,
      },
      ...prev,
    ])
    setFormOpen(false)
  }

  const setOfferStatus = (id: string, status: OfferStatus, note: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    )
    setActionNote(note)
    setPreview((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Offers
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Generate, preview, and track offer acceptance.
          </p>
        </div>
        <Feature name="recruitment.manage">
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Generate Offer
          </Button>
        </Feature>
      </div>

      <MockDataBanner message="Offer actions are UI-only. PDF generation and email delivery are not implemented." />

      {actionNote ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
          {actionNote}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {offerStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="warning">Pending offers: {pending.length}</Badge>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job / Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Joining</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell className="font-medium text-navy">
                  {offer.candidateName}
                </TableCell>
                <TableCell>
                  {offer.jobTitle}
                  <p className="text-xs text-text-secondary">
                    {offer.offeredDesignation}
                  </p>
                </TableCell>
                <TableCell>{offer.department}</TableCell>
                <TableCell>{offer.offeredSalary}</TableCell>
                <TableCell>{offer.joiningDate}</TableCell>
                <TableCell>{offer.offerExpiryDate}</TableCell>
                <TableCell>
                  <OfferStatusBadge status={offer.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setActionNote(null)
                        setPreview(offer)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Feature name="recruitment.manage">
                      {offer.status === 'Draft' ||
                      offer.status === 'Pending Approval' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setOfferStatus(
                              offer.id,
                              'Released',
                              'Offer marked as Released in UI only. No email was sent.',
                            )
                          }
                        >
                          Release
                        </Button>
                      ) : null}
                    </Feature>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Offer Letter</DialogTitle>
            <DialogDescription>
              Creates a draft offer record in mock state.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Candidate</Label>
              <Select
                value={form.candidateId}
                onValueChange={(v) => {
                  const c = candidates.find((x) => x.id === v)
                  setForm((f) => ({
                    ...f,
                    candidateId: v,
                    jobTitle: c?.appliedJobTitle ?? f.jobTitle,
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={form.jobTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, jobTitle: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Offered Designation</Label>
              <Input
                value={form.offeredDesignation}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    offeredDesignation: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments
                    .filter((d) => d !== 'All')
                    .map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Offered Salary</Label>
              <Input
                value={form.offeredSalary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, offeredSalary: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input
                type="date"
                value={form.joiningDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, joiningDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Offer Expiry Date</Label>
              <Input
                type="date"
                value={form.offerExpiryDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, offerExpiryDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={form.employmentType}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    employmentType: v as EmploymentType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      'Full-time',
                      'Part-time',
                      'Contract',
                      'Internship',
                    ] as EmploymentType[]
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Offer Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as OfferStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {offerStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveOffer}>
              Save Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Offer Preview</DialogTitle>
            <DialogDescription>
              Professional preview only — document is not emailed or downloaded.
            </DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="space-y-4 rounded-2xl border border-border-soft bg-muted-bg/30 p-5 text-sm">
              <div className="text-center">
                <p className="text-lg font-bold text-navy">HRMS</p>
                <p className="text-text-secondary">Offer of Employment</p>
              </div>
              <Separator />
              <p>
                Dear <span className="font-semibold">{preview.candidateName}</span>,
              </p>
              <p className="text-text-secondary">
                We are pleased to offer you the position of{' '}
                <span className="font-medium text-navy">
                  {preview.offeredDesignation}
                </span>{' '}
                ({preview.jobTitle}) in the {preview.department} department.
              </p>
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-secondary">Compensation</dt>
                  <dd className="font-medium">{preview.offeredSalary}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Employment type</dt>
                  <dd className="font-medium">{preview.employmentType}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Joining date</dt>
                  <dd className="font-medium">{preview.joiningDate}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Offer expires</dt>
                  <dd className="font-medium">{preview.offerExpiryDate}</dd>
                </div>
              </dl>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">Status:</span>
                <OfferStatusBadge status={preview.status} />
              </div>
              <Feature name="recruitment.manage">
                <div className="flex flex-wrap gap-2 pt-2">
                  {preview.status === 'Released' ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          setOfferStatus(
                            preview.id,
                            'Accepted',
                            'Offer marked Accepted in UI only.',
                          )
                        }
                      >
                        Mark Accepted
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setOfferStatus(
                            preview.id,
                            'Rejected',
                            'Offer marked Rejected in UI only.',
                          )
                        }
                      >
                        Mark Rejected
                      </Button>
                    </>
                  ) : null}
                  {preview.status === 'Released' ||
                  preview.status === 'Pending Approval' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setOfferStatus(
                          preview.id,
                          'Expired',
                          'Offer marked Expired in UI only.',
                        )
                      }
                    >
                      Mark Expired
                    </Button>
                  ) : null}
                  {preview.status === 'Draft' ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        setOfferStatus(
                          preview.id,
                          'Released',
                          'Offer marked as Released in UI only. No email was sent.',
                        )
                      }
                    >
                      Release Offer
                    </Button>
                  ) : null}
                </div>
              </Feature>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
