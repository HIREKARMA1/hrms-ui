/**
 * Empty state when a dashboard API returns `empty: true` or no rows.
 */

type Props = {
  title: string
  description?: string
}

export function DashboardLiveEmpty({ title, description }: Props) {
  return (
    <div
      className="rounded-xl border border-dashed border-border-soft bg-muted-bg/40 px-4 py-8 text-center"
      role="status"
    >
      <p className="text-sm font-medium text-navy">{title}</p>
      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">{description}</p>
      ) : null}
    </div>
  )
}