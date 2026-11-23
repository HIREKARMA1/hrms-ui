/**
 * Employee code input and load action for biometric punch lookup.
 */
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type BiometricCodeLookupFieldProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export function BiometricCodeLookupField({ value, onChange, onSubmit }: BiometricCodeLookupFieldProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[140px] flex-1 space-y-1">
        <Label htmlFor="bio-code-lookup">Employee code</Label>
        <Input
          id="bio-code-lookup"
          placeholder="HK0008"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onSubmit()
          }}
        />
      </div>
      <Button type="button" size="sm" className="gap-1" onClick={onSubmit} disabled={!value.trim()}>
        <Search className="h-3.5 w-3.5" />
        Load punches
      </Button>
    </div>
  )
}