import { Eye } from 'lucide-react'

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
import { TablePagination } from '@/components/ui/table-pagination'
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
          <TableHeader className="bg-[#F7F8FC]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 text-xs font-semibold tracking-wide text-text-secondary uppercase">
                Permission Code
              </TableHead>
              <TableHead className="px-4 text-xs font-semibold tracking-wide text-text-secondary uppercase">
                Module
              </TableHead>
              <TableHead className="px-4 text-xs font-semibold tracking-wide text-text-secondary uppercase">
                Description
              </TableHead>
              <TableHead className="px-4 text-center text-xs font-semibold tracking-wide text-text-secondary uppercase">
                Role Count
              </TableHead>
              <TableHead className="px-4 text-center text-xs font-semibold tracking-wide text-text-secondary uppercase">
                Actions
              </TableHead>
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
                      className="truncate font-mono text-sm font-semibold text-navy"
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
                      variant="outline"
                      className="h-8 gap-1.5 border-border-soft bg-white px-3 text-text-secondary hover:bg-[#F7F8FC] hover:text-navy"
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

      <TablePagination
        className="border-t border-border-soft px-4 py-3"
        page={page}
        totalPages={totalPages}
        total={total}
        itemLabel="permissions"
        summary={
          total === 0
            ? 'No permissions'
            : `Showing ${start}–${end} of ${total} permissions`
        }
        onPageChange={onPageChange}
      />
    </div>
  )
}
