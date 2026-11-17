import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type LeadsListRowActionsProps = {
  leadLabel: string
  onEdit: () => void
  onDelete: () => void
  showEdit?: boolean
  showDelete?: boolean
}

/** Edit / delete icon actions for leads tables (matches holiday list pattern). */
export function LeadsListRowActions({
  leadLabel,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
}: LeadsListRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {showEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-text-secondary"
          onClick={onEdit}
          aria-label={`Edit ${leadLabel}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}
      {showDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-danger hover:bg-rose-50"
          onClick={onDelete}
          aria-label={`Delete ${leadLabel}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}