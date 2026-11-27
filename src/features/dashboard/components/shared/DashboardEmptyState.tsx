type DashboardEmptyStateProps = {
  title: string
  description?: string
}

export function DashboardEmptyState({ title, description }: DashboardEmptyStateProps) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E6EF] bg-[#F7F8FC] px-4 py-8 text-center">
      <p className="text-sm font-medium text-[#17213A]">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-[#667085]">{description}</p>
      ) : null}
    </div>
  )
}
