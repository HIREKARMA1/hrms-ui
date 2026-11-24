import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from 'lucide-react'

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

import type { ManagedRole } from '../types/roleManagement.types'

type RolesTableProps = {
  roles: ManagedRole[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onView: (role: ManagedRole) => void
  onEdit: (role: ManagedRole) => void
  onDelete: (role: ManagedRole) => void
}

export function RolesTable({
  roles,
  page,
  pageSize,
  total,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: RolesTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table className="min-w-[720px] table-fixed">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[34%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Role Name</TableHead>
              <TableHead className="px-4">Description</TableHead>
              <TableHead className="px-4 text-center">Type</TableHead>
              <TableHead className="px-4 text-center">Permissions</TableHead>
              <TableHead className="px-4 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm text-text-secondary"
                >
                  No roles match your filters.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                const primaryLabel = role.name?.trim() || role.code
                const showCodeSubtext =
                  Boolean(role.name?.trim()) &&
                  role.name.trim().toUpperCase() !== role.code.toUpperCase()

                return (
                  <TableRow key={role.id}>
                    <TableCell className="px-4 align-middle">
                      <div className="min-w-0">
                        <p
                          className="truncate font-semibold text-navy"
                          title={primaryLabel}
                        >
                          {primaryLabel}
                        </p>
                        {showCodeSubtext ? (
                          <p
                            className="truncate font-mono text-xs tracking-wide text-text-secondary uppercase"
                            title={role.code}
                          >
                            {role.code}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 align-middle text-text-secondary">
                      <p
                        className="line-clamp-2 break-words"
                        title={role.description || undefined}
                      >
                        {role.description || '—'}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 text-center align-middle">
                      <div className="flex justify-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'border-0 font-medium whitespace-nowrap',
                            role.type === 'system'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-[#F0EDFF] text-[#5938DB]',
                          )}
                        >
                          {role.type === 'system' ? 'System' : 'Custom'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-center align-middle tabular-nums">
                      {role.permissionCount}
                    </TableCell>
                    <TableCell className="px-4 text-center align-middle">
                      <div className="inline-flex items-center justify-center gap-0.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="View role"
                          onClick={() => onView(role)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Edit role"
                          onClick={() => onEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title={
                            role.type === 'system'
                              ? 'System roles cannot be deleted'
                              : 'Delete role'
                          }
                          disabled={role.type === 'system'}
                          onClick={() => onDelete(role)}
                        >
                          <Trash2
                            className={cn(
                              'h-4 w-4',
                              role.type !== 'system' && 'text-rose-600',
                            )}
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border-soft px-4 py-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <span className="text-center sm:text-left">
          {total === 0
            ? 'No roles'
            : `Showing ${start}–${end} of ${total} roles`}
        </span>
        <div className="flex items-center justify-center gap-2 sm:justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
