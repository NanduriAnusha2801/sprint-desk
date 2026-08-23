import { cn } from '@/lib/cn'

function scorePassword(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
const COLORS = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success']

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const score = scorePassword(password)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1" role="presentation">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={cn('h-1 flex-1 rounded-full bg-surface-sunken', i < score && COLORS[score])}
          />
        ))}
      </div>
      {/* No label until there's a password to grade — the bars alone are the empty state. */}
      {password && <p className="text-xs text-text-muted">{LABELS[score]}</p>}
    </div>
  )
}
