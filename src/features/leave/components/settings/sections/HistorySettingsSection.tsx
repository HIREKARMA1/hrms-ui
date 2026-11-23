/**
 * Read-only append-only history of saved Leave Settings changes.
 */

import { useLeave } from '../../../hooks/useLeave'
import { formatDate } from '../../../utils/formatDate'
import { LEAVE_SETTINGS_SECTIONS } from '../../../constants/leaveSettingsSections'
import { LEAVE_TABLE_THEAD } from '../../shared/leaveUi'

export function HistorySettingsSection() {
  const { snapshot } = useLeave()
  const rows = [...(snapshot?.settingsHistory ?? [])].sort((a, b) => b.savedAt.localeCompare(a.savedAt))

  if (rows.length === 0) {
    return <p className="text-sm text-hrms-text-secondary">No saved changes yet. Updates appear here after you click Save settings.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className={LEAVE_TABLE_THEAD}>
          <tr>
            {['When', 'User', 'Section', 'Summary'].map((head) => (
              <th key={head} className="px-2 py-2 font-medium">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-hrms-border/60">
              <td className="px-2 py-2 whitespace-nowrap text-hrms-text-secondary">{formatDate(row.savedAt.slice(0, 10))} {row.savedAt.slice(11, 16)}</td>
              <td className="px-2 py-2">{row.userName}</td>
              <td className="px-2 py-2">{LEAVE_SETTINGS_SECTIONS.find((item) => item.id === row.section)?.label ?? row.section}</td>
              <td className="px-2 py-2 text-hrms-navy">{row.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
