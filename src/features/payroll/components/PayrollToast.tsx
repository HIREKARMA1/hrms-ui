/**
 * Renders stacked toast notifications for payroll actions.
 * Used by PayrollToastProvider at the root of PayrollPage.
 */

type PayrollToastProps = {
  messages: { id: number; text: string }[]
}

export function PayrollToast({ messages }: PayrollToastProps) {
  if (messages.length === 0) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col gap-2"
      aria-live="polite"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className="rounded-xl border border-hrms-border bg-white px-4 py-3 text-sm font-medium text-hrms-navy shadow-lg"
        >
          {message.text}
        </div>
      ))}
    </div>
  )
}
