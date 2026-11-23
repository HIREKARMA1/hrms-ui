import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { recentLeaveRequests } from '../utils/sampleData'

const statusVariant = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
} as const

export function RecentLeaveRequests() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Leave Requests</CardTitle>
        <CardDescription>Latest leave applications across teams</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 pr-3 font-medium">Employee</th>
                <th className="pb-3 pr-3 font-medium">Leave Type</th>
                <th className="pb-3 pr-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaveRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="py-3 pr-3 font-medium text-slate-900">
                    {request.employee}
                  </td>
                  <td className="py-3 pr-3 text-slate-600">{request.leaveType}</td>
                  <td className="py-3 pr-3 text-slate-600">{request.duration}</td>
                  <td className="py-3">
                    <Badge variant={statusVariant[request.status]}>
                      {request.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
