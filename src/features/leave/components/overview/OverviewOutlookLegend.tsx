/**
 * Legend for the 14-day outlook strip.
 */

export function OverviewOutlookLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-hrms-text-secondary">
      <li className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full border-2 border-hrms-primary" /> Today
      </li>
      <li className="flex items-center gap-1">
        <span className="h-2 w-4 rounded bg-hrms-muted-bg" /> Weekly off
      </li>
      <li className="flex items-center gap-1">
        <span className="h-2 w-4 rounded bg-hrms-info/20" /> Holiday
      </li>
      <li className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-hrms-warning" /> Coverage limit
      </li>
      <li>Number = people on leave</li>
    </ul>
  )
}
