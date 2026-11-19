import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type HolidayListRowActionsProps = {
  holidayName: string
  onEdit: () => void
  onDelete: () => void
  showDelete?: boolean
}

export function HolidayListRowActions({
  holidayName,
  onEdit,
  onDelete,
  showDelete = true,
}: HolidayListRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
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