/**
 * Legend for the 14-day outlook strip.
 */

export function OverviewOutlookLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#667085]">
      <li className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm border-2 border-[#5938DB]" aria-hidden /> Today
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-2 w-5 rounded border border-dashed border-[#E2E6EF] bg-[#EEF0F6]" aria-hidden /> Weekly off
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-2 w-5 rounded bg-[#3B82F61A]" aria-hidden /> Holiday
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" aria-hidden /> Coverage limit
      </li>
      <li>Number = people on leave</li>
    </ul>
  )
}