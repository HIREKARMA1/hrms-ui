import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import type { ManagedPermission } from '../types/permissionManagement.types'
import {
  formatModuleLabel,
  getModuleBadgeClass,
} from '../utils/moduleBadgeStyles'

type PermissionsTableProps = {
  permissions: ManagedPermission[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onView: (permission: ManagedPermission) => void
}

function buildPageNumbers(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  return Array.from({ length: 5 }, (_, index) => start + index)
}

export function PermissionsTable({
  permissions,
  page,
  pageSize,
  total,
  onPageChange,
  onView,
}: PermissionsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const pageNumbers = buildPageNumbers(page, totalPages)

  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table className="min-w-[800px] table-fixed">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[36%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Permission Code</TableHead>
              <TableHead className="px-4">Module</TableHead>
              <TableHead className="px-4">Description</TableHead>
              <TableHead className="px-4 text-center">Role Count</TableHead>
              <TableHead className="px-4 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm text-text-secondary"
                >
                  No permissions match your filters.
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="px-4 align-middle">
                    <p
                      className="truncate font-semibold text-navy"
                      title={permission.code}
                    >
                      {permission.code}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 align-middle">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'border-0 font-medium whitespace-nowrap',
                        getModuleBadgeClass(permission.module),
                      )}
                    >
                      {formatModuleLabel(permission.module)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 align-middle text-text-secondary">
                    <p
                      className="line-clamp-2 break-words"
                      title={permission.description || undefined}
                    >
                      {permission.description || '—'}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 text-center align-middle tabular-nums text-navy">
                    {permission.roleCount}
                  </TableCell>
                  <TableCell className="px-4 text-center align-middle">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-text-secondary hover:text-navy"
                      title="View permission"
                      onClick={() => onView(permission)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border-soft px-4 py-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <span className="text-center sm:text-left">
          {total === 0
            ? 'No permissions'
            : `Showing ${start}–${end} of ${total} permissions`}
        </span>
        <div className="flex items-center justify-center gap-1 sm:justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={page <= 1}
            aria-label="Previous page"
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              size="sm"
              variant={pageNumber === page ? 'default' : 'outline'}
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={page >= totalPages}
            aria-label="Next page"
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
