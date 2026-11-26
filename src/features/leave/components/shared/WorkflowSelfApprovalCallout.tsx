type WorkflowSelfApprovalCalloutProps = {
  messages: string[]
}

export function WorkflowSelfApprovalCallout({ messages }: WorkflowSelfApprovalCalloutProps) {
  if (messages.length === 0) return null
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      <p className="font-medium text-amber-950">Self-approval risk</p>
      <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  )
}