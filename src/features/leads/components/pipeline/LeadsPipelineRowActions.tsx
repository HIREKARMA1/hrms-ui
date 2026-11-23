import { ArrowRightLeft, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { LEAD_STATUSES } from '../../constants/leadOptions'
import type { LeadStatus } from '../../types/lead'

type LeadsPipelineRowActionsProps = {
  leadLabel: string
  currentStatus: LeadStatus
  canMove: boolean
  canEdit: boolean
  canDelete: boolean
  onMove: (status: LeadStatus) => void
  onEdit: () => void
  onDelete: () => void
}

export function LeadsPipelineRowActions({
  leadLabel,
  currentStatus,
  canMove,
  canEdit,
  canDelete,
  onMove,
  onEdit,
  onDelete,
}: LeadsPipelineRowActionsProps) {
  const moveTargets = LEAD_STATUSES.filter((s) => s !== currentStatus)

  return (
    <div className="flex items-center justify-end gap-0.5">
      {canMove ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-hrms-text-secondary"
              aria-label={`Move ${leadLabel} to another stage`}
              onClick={(e) => e.stopPropagation()}
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
      {canEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-text-secondary"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          aria-label={`Edit ${leadLabel}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}
      {canDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-danger hover:bg-rose-50"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label={`Delete ${leadLabel}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}