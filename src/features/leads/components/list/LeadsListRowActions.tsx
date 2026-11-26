import { Pencil, Trash2, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type LeadsListRowActionsProps = {
  leadLabel: string
  onEdit?: () => void
  onDelete?: () => void
  onAssign?: () => void
  showEdit?: boolean
  showDelete?: boolean
  showAssign?: boolean
}

/** Edit / assign / delete icon actions for leads tables. */
export function LeadsListRowActions({
  leadLabel,
  onEdit,
  onDelete,
  onAssign,
  showEdit = true,
  showDelete = true,
  showAssign = false,
}: LeadsListRowActionsProps) {
  if (!showEdit && !showDelete && !showAssign) return null

  return (
    <div className="flex items-center gap-1">
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
