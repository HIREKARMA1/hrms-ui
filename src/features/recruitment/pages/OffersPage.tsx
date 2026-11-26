import { Plus, RefreshCw, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { Feature } from '@/features/rbac/components/Feature'
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
import { Skeleton } from '@/components/ui/skeleton'
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
import { getApiErrorMessage } from '@/services/api/errors'

import { CANDIDATES_PAGE_SIZE, useListCandidatesQuery } from '../api/candidatesApi'
import {
  OFFERS_PAGE_SIZE,
  OFFER_STATUSES,
  useCreateOfferMutation,
  useListOffersQuery,
  useUpdateOfferStatusMutation,
  useUploadOfferLetterMutation,
} from '../api/offersApi'
import type { OfferStatus } from '../api/offersApi.types'
import { ApiOfferStatusBadge, RecruitmentPageShell } from '../components'
import { formatOfferStatus } from '../utils/applicationFormat'
import { getOfferErrorMessage } from '../api/offersApi'

type OfferForm = {
  candidateId: string
  offeredDesignation: string
  department: string
  salary: string
  joiningDate: string
  expiryDate: string
}

const emptyForm: OfferForm = {
  candidateId: '',
  offeredDesignation: '',
  department: '',
  salary: '',
  joiningDate: '',
  expiryDate: '',
}

export function OffersPage() {
  const [statusFilter, setStatusFilter] = useState('__all__')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<OfferForm>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadOfferId, setUploadOfferId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const list = useListOffersQuery({
    page: 1,
    limit: OFFERS_PAGE_SIZE,
    ...(statusFilter !== '__all__' ? { status: statusFilter as OfferStatus } : {}),
  })
  const candidatesQuery = useListCandidatesQuery({ page: 1, limit: CANDIDATES_PAGE_SIZE })
  const [createOffer] = useCreateOfferMutation()
  const [updateStatus] = useUpdateOfferStatusMutation()
  const [uploadLetter] = useUploadOfferLetterMutation()

  const items = list.data?.items ?? []

  const openCreate = () => {
    const candidate = candidatesQuery.data?.items?.[0]
    setForm({
      ...emptyForm,
      candidateId: candidate?.id ?? '',
    })
    setFormError(null)
    setFormOpen(true)
  }

  const saveOffer = async () => {
    if (!form.candidateId) {
      setFormError('Select a candidate.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      await createOffer({
        candidateId: form.candidateId,
        offeredDesignation: form.offeredDesignation || undefined,
        department: form.department || undefined,
        salary: form.salary ? Number(form.salary) : undefined,
        joiningDate: form.joiningDate || undefined,
        expiryDate: form.expiryDate || undefined,
      }).unwrap()
      setFormOpen(false)
    } catch (error) {
      setFormError(getOfferErrorMessage(error, 'Could not create offer.'))
    } finally {
      setSaving(false)
    }
  }

  const onLetterSelected = async (offerId: string, file: File | undefined) => {
    if (!file) return
    try {
      await uploadLetter({ id: offerId, file }).unwrap()
    } catch (error) {
      window.alert(getOfferErrorMessage(error, 'Could not upload offer letter.'))
    }
  }

  return (
    <RecruitmentPageShell
      activeSection="Offers"
      trailing={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void list.refetch()}
            disabled={list.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${list.isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Feature name="recruitment.manage">
            <Button type="button" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Offer
            </Button>
          </Feature>
        </div>
      }
    >
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="mb-4 w-full lg:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All statuses</SelectItem>
          {OFFER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {formatOfferStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        {list.isLoading ? (
          <Skeleton className="m-4 h-32 w-full" />
        ) : list.isError ? (
          <div className="space-y-3 p-6">
            <p role="alert" className="text-sm text-red-600">
              {getApiErrorMessage(list.error, 'Could not load offers.')}
            </p>
            <Button type="button" variant="outline" onClick={() => void list.refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No offers found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Joining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Letter</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium text-navy">
                    {offer.candidateName ?? offer.candidateId}
                  </TableCell>
                  <TableCell>
                    {offer.offeredDesignation ?? '—'}
                    <p className="text-xs text-text-secondary">{offer.jobTitle}</p>
                  </TableCell>
                  <TableCell>
                    {offer.salary != null
                      ? `${offer.salaryCurrency ?? ''} ${offer.salary}`
                      : '—'}
                  </TableCell>
                  <TableCell>{offer.joiningDate ?? '—'}</TableCell>
                  <TableCell>
                    <ApiOfferStatusBadge status={offer.status} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {offer.offerLetterFileName ?? offer.offerLetterUrl ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Feature name="recruitment.manage">
                      <div className="flex justify-end gap-1">
                        {offer.status === 'RELEASED' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void updateStatus({
                                id: offer.id,
                                body: { status: 'ACCEPTED' },
                              })
                            }
                          >
                            Accept
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setUploadOfferId(offer.id)
                            fileInputRef.current?.click()
                          }}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </Feature>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (uploadOfferId && file) void onLetterSelected(uploadOfferId, file)
          e.target.value = ''
        }}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create offer</DialogTitle>
            <DialogDescription>POST `/recruitment/offers`</DialogDescription>
          </DialogHeader>
          {formError ? (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          ) : null}
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Candidate</Label>
              <Select
                value={form.candidateId}
                onValueChange={(v) => setForm((f) => ({ ...f, candidateId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Candidate" />
                </SelectTrigger>
                <SelectContent>
                  {(candidatesQuery.data?.items ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(
              [
                ['offeredDesignation', 'Designation'],
                ['department', 'Department'],
                ['salary', 'Salary'],
                ['joiningDate', 'Joining date'],
                ['expiryDate', 'Expiry date'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  type={key.includes('Date') ? 'date' : 'text'}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Feature name="recruitment.manage">
              <Button type="button" onClick={() => void saveOffer()} disabled={saving}>
                {saving ? 'Creating…' : 'Create'}
              </Button>
            </Feature>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RecruitmentPageShell>
  )
}