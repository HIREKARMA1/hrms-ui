import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type HolidayListRowActionsProps = {
  holidayName: string
  onEdit: () => void
  onDelete: () => void
  /** Hide the edit action (defaults to shown). */
  showEdit?: boolean
  /** Hide the delete action (defaults to shown). */
  showDelete?: boolean
}

export function HolidayListRowActions({
  holidayName,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
}: HolidayListRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {showEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-text-secondary"
          onClick={onEdit}
          aria-label={`Edit ${holidayName}`}
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
          aria-label={`Delete ${holidayName}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
