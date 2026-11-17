import { Download, Eye, Plus, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Feature } from '@/features/rbac/components/Feature'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
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

import {
  documentCategories,
  employeeDocumentsMock,
} from '../mocks/employeeDocuments.mock'
import type {
  DocumentCategory,
  DocumentVerificationStatus,
  EmployeeDocument,
} from '../types/employeeDocuments.types'

type EmployeeDocumentsPageProps = {
  /** Employee self-service: only own documents for demo EMP-1021. */
  ownDocumentsOnly?: boolean
}

/**
 * Additive document management for existing `/…/documents` nav routes.
 * Reuses Input type=file; no separate upload library. Storage is UI-only.
 */
export function EmployeeDocumentsPage({
  ownDocumentsOnly = false,
}: EmployeeDocumentsPageProps) {
  const { canAccess } = useOptionalFeatureAccess()
  const [docs, setDocs] = useState(() => structuredClone(employeeDocumentsMock))
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [versionDoc, setVersionDoc] = useState<EmployeeDocument | null>(null)
  const [actionNote, setActionNote] = useState<string | null>(null)
  const [uploadForm, setUploadForm] = useState({
    employeeName: 'Ishita Kapoor',
    employeeId: 'EMP-1201',
    category: 'Resume' as DocumentCategory,
    fileName: '',
    expiryDate: '',
    accessLevel: 'Employee+HR' as EmployeeDocument['accessLevel'],
  })

  const canEdit = ownDocumentsOnly
    ? canAccess('employee.documents.own')
    : canAccess('employee.documents.edit')

  const filtered = useMemo(() => {
    return docs.filter((doc) => {
      if (ownDocumentsOnly && doc.employeeId !== 'EMP-1021') return false
      if (categoryFilter !== 'All' && doc.category !== categoryFilter) return false
      if (statusFilter !== 'All' && doc.verificationStatus !== statusFilter)
        return false
      return true
    })
  }, [docs, ownDocumentsOnly, categoryFilter, statusFilter])

  const expiryReminders = useMemo(
    () =>
      filtered.filter(
        (d) =>
          d.expiryDate &&
          (d.verificationStatus === 'Expired' ||
            d.expiryDate <= '2026-12-31'),
      ),
    [filtered],
  )

  const saveUpload = () => {
    if (!uploadForm.fileName) return
    const now = new Date().toISOString().slice(0, 10)
    setDocs((prev) => [
      {
        id: `doc-${Date.now()}`,
        employeeId: uploadForm.employeeId,
        employeeName: uploadForm.employeeName,
        category: uploadForm.category,
        fileName: uploadForm.fileName,
        verificationStatus: 'Pending',
        uploadedAt: now,
        expiryDate: uploadForm.expiryDate,
        accessLevel: uploadForm.accessLevel,
        versions: [
          {
            version: 1,
            fileName: uploadForm.fileName,
            uploadedAt: now,
            uploadedBy: ownDocumentsOnly ? 'Employee' : 'HR (UI)',
          },
        ],
      },
      ...prev,
    ])
    setUploadOpen(false)
    setActionNote(
      'Document metadata saved in UI session only. File was not uploaded to a server.',
    )
  }

  const setVerification = (id: string, status: DocumentVerificationStatus) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, verificationStatus: status } : d,
      ),
    )
  }

  const downloadUiOnly = (doc: EmployeeDocument) => {
    setActionNote(
      `Download simulated for “${doc.fileName}”. No file storage API is connected.`,
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="warning">UI-only uploads</Badge>
            <Badge variant="secondary">No document API</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            {ownDocumentsOnly ? 'My Documents' : 'Employee Documents'}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Resume, KYC, certificates, letters, verification and version history.
          </p>
        </div>
        {canEdit ? (
          <Button
            type="button"
            className="gap-2"
            onClick={() => {
              setUploadForm((f) => ({
                ...f,
                fileName: '',
                ...(ownDocumentsOnly
                  ? {
                      employeeId: 'EMP-1021',
                      employeeName: 'Ananya Sharma',
                    }
                  : {}),
              }))
              setUploadOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        ) : null}
      </div>

      {actionNote ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          {actionNote}
        </div>
      ) : null}

      {expiryReminders.length > 0 ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <p className="font-medium">Document expiry reminders</p>
          <ul className="mt-1 list-inside list-disc">
            {expiryReminders.map((d) => (
              <li key={d.id}>
                {d.employeeName} · {d.category} · expires {d.expiryDate || 'n/a'}{' '}
                ({d.verificationStatus})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm sm:flex-row">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {documentCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {(
              [
                'Pending',
                'Verified',
                'Rejected',
                'Expired',
              ] as DocumentVerificationStatus[]
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {!ownDocumentsOnly ? <TableHead>Employee</TableHead> : null}
              <TableHead>Category</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doc) => (
              <TableRow key={doc.id}>
                {!ownDocumentsOnly ? (
                  <TableCell>
                    <p className="font-medium text-navy">{doc.employeeName}</p>
                    <p className="text-xs text-text-secondary">{doc.employeeId}</p>
                  </TableCell>
                ) : null}
                <TableCell>{doc.category}</TableCell>
                <TableCell className="text-text-secondary">{doc.fileName}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      doc.verificationStatus === 'Verified'
                        ? 'success'
                        : doc.verificationStatus === 'Pending'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {doc.verificationStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{doc.accessLevel}</Badge>
                </TableCell>
                <TableCell>{doc.expiryDate || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setVersionDoc(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadUiOnly(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Feature name="employee.documents.edit">
                      {!ownDocumentsOnly ? (
                        <Select
                          onValueChange={(v) =>
                            setVerification(
                              doc.id,
                              v as DocumentVerificationStatus,
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue placeholder="Verify" />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              [
                                'Pending',
                                'Verified',
                                'Rejected',
                                'Expired',
                              ] as DocumentVerificationStatus[]
                            ).map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                    </Feature>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>
              File bytes are not stored. Only the file name is kept for this demo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {!ownDocumentsOnly ? (
              <>
                <div className="space-y-2">
                  <Label>Employee name</Label>
                  <Input
                    value={uploadForm.employeeName}
                    onChange={(e) =>
                      setUploadForm((f) => ({
                        ...f,
                        employeeName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input
                    value={uploadForm.employeeId}
                    onChange={(e) =>
                      setUploadForm((f) => ({
                        ...f,
                        employeeId: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            ) : null}
            <div className="space-y-2">
              <Label>Document type</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(v) =>
                  setUploadForm((f) => ({
                    ...f,
                    category: v as DocumentCategory,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setUploadForm((f) => ({
                    ...f,
                    fileName: e.target.files?.[0]?.name ?? '',
                  }))
                }
              />
              {uploadForm.fileName ? (
                <p className="flex items-center gap-1 text-xs text-text-secondary">
                  <Upload className="h-3 w-3" />
                  {uploadForm.fileName}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Expiry date (optional)</Label>
              <Input
                type="date"
                value={uploadForm.expiryDate}
                onChange={(e) =>
                  setUploadForm((f) => ({ ...f, expiryDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Access permission</Label>
              <Select
                value={uploadForm.accessLevel}
                onValueChange={(v) =>
                  setUploadForm((f) => ({
                    ...f,
                    accessLevel: v as EmployeeDocument['accessLevel'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR-only">HR-only</SelectItem>
                  <SelectItem value="Employee+HR">Employee+HR</SelectItem>
                  <SelectItem value="Admin-view">Admin-view</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveUpload}>
              Save metadata
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(versionDoc)}
        onOpenChange={(open) => !open && setVersionDoc(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document version history</DialogTitle>
            <DialogDescription>
              {versionDoc?.category} · {versionDoc?.fileName}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {versionDoc?.versions.map((v) => (
              <li
                key={`${v.version}-${v.fileName}`}
                className="rounded-xl border border-border-soft px-3 py-2 text-sm"
              >
                v{v.version} · {v.fileName}
                <p className="text-xs text-text-secondary">
                  {v.uploadedAt} · {v.uploadedBy}
                </p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function MyEmployeeDocumentsPage() {
  return <EmployeeDocumentsPage ownDocumentsOnly />
}
