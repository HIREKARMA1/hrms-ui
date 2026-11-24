import { Bell, Loader2, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type HolidayListRowActionsProps = {
  holidayName: string
  onEdit: () => void
  onDelete: () => void
  /** Hide the edit action (defaults to shown). */
  showEdit?: boolean
  /** Hide the delete action (defaults to shown). */
  showDelete?: boolean
  onNotify?: () => void
  showNotify?: boolean
  /** Disabled bell when type cannot be notified (e.g. Optional). */
  showNotifyBlocked?: boolean
  notifyBlockedTitle?: string
  notifyLoading?: boolean
}

export function HolidayListRowActions({
  holidayName,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  onNotify,
  showNotify = false,
  showNotifyBlocked = false,
  notifyBlockedTitle,
  notifyLoading = false,
}: HolidayListRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {showNotify && onNotify ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-text-secondary"
          disabled={notifyLoading}
          onClick={onNotify}
          aria-label={`Notify employees about ${holidayName}`}
        >
          {notifyLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </Button>
      ) : null}
      {showNotifyBlocked ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-hrms-text-secondary opacity-40"
          disabled
          title={notifyBlockedTitle}
          aria-label={`Notify not available for ${holidayName}`}
        >
          <Bell className="h-4 w-4" />
        </Button>
      ) : null}
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
