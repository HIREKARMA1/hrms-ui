import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { recruitmentPipeline } from '../utils/sampleData'

const maxCount = Math.max(...recruitmentPipeline.map((stage) => stage.count))

export function RecruitmentPipeline() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recruitment Pipeline</CardTitle>
        <CardDescription>Candidate progress across hiring stages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recruitmentPipeline.map((stage) => (
          <div key={stage.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700">{stage.label}</span>
              <span className="font-semibold text-slate-900">{stage.count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${(stage.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
