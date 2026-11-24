import { Download, Eye, FileText, MoreHorizontal, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  EMPLOYEE_MAX_TAKE,
  useGetEmployeeQuery,
  useListEmployeesQuery,
} from '../api/employeesApi'
import type { EmployeeDocument } from '../types/employeeDocuments.types'
import {
  mapEmployeeDocumentOptions,
  mapEmployeeRecordsToDocuments,
  type EmployeeDocumentOption,
} from '../utils/mapServerDocuments'

type EmployeeDocumentsPageProps = {
  /** Employee self-service: only documents for the signed-in employee. */
  ownDocumentsOnly?: boolean
}

type EmployeeDocumentsRow = EmployeeDocumentOption & {
  documents: EmployeeDocument[]
}

/**
 * One row per employee. Actions menu opens a dialog listing that employee's
 * documents with individual view/download.
 */
export function EmployeeDocumentsPage({
  ownDocumentsOnly = false,
}: EmployeeDocumentsPageProps) {
  const { user } = useAuthenticatedUser()
  const ownEmployeeId = user?.employeeId?.trim() || ''

  const listQuery = useListEmployeesQuery(
    { skip: 0, take: EMPLOYEE_MAX_TAKE },
    { skip: ownDocumentsOnly },
  )
  const ownQuery = useGetEmployeeQuery(ownEmployeeId, {
    skip: !ownDocumentsOnly || !ownEmployeeId,
  })

  const [search, setSearch] = useState('')
  const [actionNote, setActionNote] = useState<string | null>(null)
  const [docsDialogEmployeeId, setDocsDialogEmployeeId] = useState<string | null>(
    null,
  )

  const employees = useMemo(() => {
    if (ownDocumentsOnly) {
      return ownQuery.data ? [ownQuery.data] : []
    }
    return listQuery.data?.items ?? []
  }, [ownDocumentsOnly, ownQuery.data, listQuery.data?.items])

  const allDocs = useMemo(
    () => mapEmployeeRecordsToDocuments(employees),
    [employees],
  )

  const rows: EmployeeDocumentsRow[] = useMemo(() => {
    const options = mapEmployeeDocumentOptions(employees)
    return options.map((opt) => ({
      ...opt,
      documents: allDocs.filter((doc) => doc.employeeId === opt.id),
    }))
  }, [employees, allDocs])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.employeeCode.toLowerCase().includes(q),
    )
  }, [rows, search])

  const dialogRow = useMemo(
    () => rows.find((row) => row.id === docsDialogEmployeeId) ?? null,
    [rows, docsDialogEmployeeId],
  )

  useEffect(() => {
    if (!docsDialogEmployeeId) return
    if (!rows.some((row) => row.id === docsDialogEmployeeId)) {
      setDocsDialogEmployeeId(null)
    }
  }, [rows, docsDialogEmployeeId])

  const loading = ownDocumentsOnly
    ? Boolean(ownEmployeeId) && ownQuery.isLoading
    : listQuery.isLoading
  const loadError = ownDocumentsOnly ? ownQuery.error : listQuery.error

  const openDocument = (doc: EmployeeDocument, mode: 'view' | 'download') => {
    if (!doc.fileUrl) {
      setActionNote(
        `No file URL for “${doc.fileName}”. Re-upload or verify onboarding documents again.`,
      )
      return
    }
    window.open(doc.fileUrl, '_blank', 'noopener,noreferrer')
    if (mode === 'download') {
      setActionNote(`Opened “${doc.fileName}” for download / preview.`)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="success">Live employee documents</Badge>
          <Badge variant="secondary">Grouped by employee</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          {ownDocumentsOnly ? 'My Documents' : 'Employee Documents'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {ownDocumentsOnly
            ? 'Open the actions menu to view and download your documents.'
            : 'Each employee is listed once. Use the actions menu to view all of their documents and download individually.'}
        </p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {getApiErrorMessage(loadError, 'Could not load employee documents.')}
        </div>
      ) : null}

      {ownDocumentsOnly && !ownEmployeeId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          Your account is not linked to an employee profile yet, so there are no documents to show.
        </div>
      ) : null}

      {actionNote ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
          {actionNote}
        </div>
      ) : null}

      {!ownDocumentsOnly ? (
        <div className="rounded-2xl border border-border-soft bg-white p-4 shadow-sm">
          <label className="relative block max-w-md">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
              Search employee
            </span>
            <Search className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or employee code"
            />
          </label>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            ) : null}
            {!loading && filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                  {rows.length === 0
                    ? 'No employees found. Register or verify an organisation onboarding form first.'
                    : 'No employees match this search.'}
                </TableCell>
              </TableRow>
            ) : null}
            {filteredRows.map((row) => {
              const categories = [
                ...new Set(row.documents.map((doc) => doc.category)),
              ]
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-medium text-navy">{row.name}</p>
                    <p className="text-xs text-text-secondary">{row.employeeCode}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {row.documents.length} file
                      {row.documents.length === 1 ? '' : 's'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {categories.length === 0 ? (
                      <span className="text-sm text-slate-500">No documents yet</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {categories.slice(0, 3).map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                        {categories.length > 3 ? (
                          <Badge variant="outline">+{categories.length - 3}</Badge>
                        ) : null}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Actions for ${row.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => setDocsDialogEmployeeId(row.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View all documents
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(dialogRow)}
        onOpenChange={(open) => {
          if (!open) setDocsDialogEmployeeId(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Documents — {dialogRow?.name}</DialogTitle>
            <DialogDescription>
              {dialogRow?.employeeCode}
              {dialogRow
                ? ` · ${dialogRow.documents.length} document${dialogRow.documents.length === 1 ? '' : 's'}`
                : null}
            </DialogDescription>
          </DialogHeader>

          {!dialogRow || dialogRow.documents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No documents for this employee yet.
            </p>
          ) : (
            <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {dialogRow.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-col gap-3 rounded-xl border border-border-soft bg-slate-50/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <FileText className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy">
                        {doc.category}
                      </p>
                      <p className="truncate text-xs text-text-secondary" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
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
                        <Badge variant="outline">{doc.accessLevel}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1 self-end sm:self-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openDocument(doc, 'view')}
                      disabled={!doc.fileUrl}
                    >
                      <Eye className="mr-1.5 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => openDocument(doc, 'download')}
                      disabled={!doc.fileUrl}
                    >
                      <Download className="mr-1.5 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function MyEmployeeDocumentsPage() {
  return <EmployeeDocumentsPage ownDocumentsOnly />
}
