import { ArrowRightLeft, Pencil, Trash2, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { LEAD_STATUSES } from '../../constants/leadOptions'
import type { LeadStatus } from '../../types/lead'

type LeadsListRowActionsProps = {
  leadLabel: string
  currentStatus?: LeadStatus
  onMove?: (status: LeadStatus) => void
  onEdit?: () => void
  onDelete?: () => void
  onAssign?: () => void
  showMove?: boolean
  showEdit?: boolean
  showDelete?: boolean
  showAssign?: boolean
}

/** Move / edit / assign / delete icon actions for leads tables. */
export function LeadsListRowActions({
  leadLabel,
  currentStatus,
  onMove,
  onEdit,
  onDelete,
  onAssign,
  showMove = false,
  showEdit = true,
  showDelete = true,
  showAssign = false,
}: LeadsListRowActionsProps) {
  if (!showMove && !showEdit && !showDelete && !showAssign) return null

  const moveTargets = currentStatus
    ? LEAD_STATUSES.filter((status) => status !== currentStatus)
    : LEAD_STATUSES

  return (
    <div className="flex items-center gap-1">
      {showMove && onMove ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-hrms-text-secondary"
              aria-label={`Move ${leadLabel} to another stage`}
              title="Move to"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
            <p className="px-2 py-1.5 text-xs font-medium text-hrms-text-muted">Move to</p>
            {moveTargets.map((status) => (
              <DropdownMenuItem
                key={status}
                className="text-sm"
                onSelect={() => onMove(status)}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {showAssign && onAssign ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-text-secondary"
          onClick={onAssign}
          aria-label={`Assign ${leadLabel}`}
          title="Assign"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      ) : null}
      {showEdit && onEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-text-secondary"
          onClick={onEdit}
          aria-label={`Edit ${leadLabel}`}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}
      {showDelete && onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-danger hover:bg-rose-50"
          onClick={onDelete}
          aria-label={`Delete ${leadLabel}`}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
