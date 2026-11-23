import { MessageSquare, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import type { AdminRequestStatus, AdminSupportRequest } from '../types/adminSupportRequest'

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

function requestSummary(request: AdminSupportRequest): string {
  return (
    request.otherDetail?.trim() ||
    request.note?.trim() ||
    'No additional message'
  )
}

const STATUS_FILTERS: { value: AdminRequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
]

type AdminRequestsTableProps = {
  requests: AdminSupportRequest[]
  statusFilter: AdminRequestStatus | 'all'
  onStatusFilterChange: (value: AdminRequestStatus | 'all') => void
  search: string
  onSearchChange: (value: string) => void
  onReply: (request: AdminSupportRequest) => void
  onDelete: (request: AdminSupportRequest) => void
}

export function AdminRequestsTable({
  requests,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  onReply,
  onDelete,
}: AdminRequestsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onStatusFilterChange(filter.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                statusFilter === filter.value
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search email or employee ID"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-hrms-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead className="max-w-[220px]">Summary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-slate-500">
                  No requests match your filters.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">
                    {formatWhen(request.createdAt)}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-900">{request.email}</p>
                    {request.employeeId ? (
                      <p className="text-xs text-slate-500">{request.employeeId}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <AdminRequestIssueBadges issues={request.issues} />
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm text-slate-600">
                    {requestSummary(request)}
                  </TableCell>
                  <TableCell>
                    <AdminRequestStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={request.status === 'open' ? 'default' : 'outline'}
                        onClick={() => onReply(request)}
                      >
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        Reply
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        title="Delete request"
                        aria-label={`Delete ${request.id}`}
                        onClick={() => onDelete(request)}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" aria-hidden />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}