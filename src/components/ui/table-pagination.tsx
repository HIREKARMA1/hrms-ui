import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { buildPaginationItems } from './table-pagination.utils'

export type TablePaginationProps = {
  page: number
  totalPages: number
  /** Total item count for the summary line. */
  total?: number
  /** Noun used in the default summary, e.g. "roles". */
  itemLabel?: string
  /** Override the left-side summary text entirely. */
  summary?: string
  /**
   * Hard-disable all controls (e.g. no data / permission). Prefer leaving this
   * false while a page fetch is in flight so Prev/Next stay responsive.
   */
  disabled?: boolean
  className?: string
  onPageChange: (page: number) => void
}

/**
 * Responsive table footer pagination:
 * `< Previous` · page numbers (active highlighted) · `…` · `Next >`
 */
export function TablePagination({
  page,
  totalPages,
  total,
  itemLabel = 'items',
  summary,
  disabled = false,
  className,
  onPageChange,
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotalPages)
  const items = buildPaginationItems(safePage, safeTotalPages)

  const goToPage = useCallback(
    (next: number) => {
      if (disabled) return
      const clamped = Math.min(Math.max(1, next), safeTotalPages)
      if (clamped === safePage) return
      onPageChange(clamped)
    },
    [disabled, onPageChange, safePage, safeTotalPages],
  )

  const resolvedSummary =
    summary ??
    (total === undefined
      ? `Page ${safePage} of ${safeTotalPages}`
      : total === 0
        ? `No ${itemLabel}`
        : `Page ${safePage} of ${safeTotalPages} · ${total} ${itemLabel}`)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-center sm:text-left">{resolvedSummary}</p>

      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center justify-center gap-1 sm:justify-end"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1 px-2.5 text-navy hover:bg-muted-bg disabled:text-text-secondary"
          disabled={disabled || safePage <= 1}
          onClick={() => goToPage(safePage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden xs:inline sm:inline">Previous</span>
        </Button>

        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-text-secondary"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant="ghost"
              size="sm"
              aria-current={item === safePage ? 'page' : undefined}
              aria-label={`Page ${item}`}
              className={cn(
                'h-9 min-w-9 px-2 font-medium tabular-nums',
                item === safePage
                  ? 'bg-navy text-white hover:bg-navy hover:text-white'
                  : 'text-navy hover:bg-muted-bg',
              )}
              disabled={disabled || item === safePage}
              onClick={() => goToPage(item)}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1 px-2.5 text-navy hover:bg-muted-bg disabled:text-text-secondary"
          disabled={disabled || safePage >= safeTotalPages}
          onClick={() => goToPage(safePage + 1)}
        >
          <span className="hidden xs:inline sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  )
}
