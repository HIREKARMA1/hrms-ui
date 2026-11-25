type AttendanceReportFallbackBannerProps = {
  fallbackReason?: string
  source?: string
}

export function AttendanceReportFallbackBanner({
  fallbackReason,
  source,
}: AttendanceReportFallbackBannerProps) {
  if (!fallbackReason) return null
  return (
    <div className="rounded-[14px] border border-[#FEF3DC] bg-[#FEF3DC] px-4 py-3 text-sm text-[#B45309]">
      <p className="font-semibold">Using {source ?? 'stored'} data</p>
      <p className="mt-1 text-[#B45309]/90">{fallbackReason}</p>
    </div>
  )
}