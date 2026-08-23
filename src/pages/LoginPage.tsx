import { Kanban, ListChecks, Radar, Rocket } from 'lucide-react'
import { LoginForm } from '@/features/auth/LoginForm'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const PILLARS = [
  { icon: ListChecks, label: 'Plan' },
  { icon: Radar, label: 'Track' },
  { icon: Rocket, label: 'Ship' },
]

const DOT_GRID_STYLE = {
  backgroundImage: 'radial-gradient(rgb(var(--color-border-strong)) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface-sunken px-6 py-10">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-40" style={DOT_GRID_STYLE} aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-24 size-96 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex w-full max-w-4xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="flex max-w-md flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent text-accent-fg">
              <Kanban className="size-5" aria-hidden="true" />
            </span>
            <span className="text-base font-bold text-text-primary">SprintDesk</span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight text-text-primary lg:text-4xl">
            Sprint planning without the chaos.
          </h1>
          <p className="text-sm text-text-secondary">
            One focused workspace for your board, your deadlines and your team&apos;s workload — no spreadsheets,
            no guesswork.
          </p>

          <div className="flex items-center gap-3">
            {PILLARS.map(({ icon: Icon, label }, index) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-text-secondary">
                  <Icon className="size-3.5 text-accent" aria-hidden="true" />
                  {label}
                </span>
                {index < PILLARS.length - 1 && <span className="text-text-muted">→</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm shrink-0 rounded-xl border border-border bg-surface-raised p-6 shadow-popover sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Welcome back</h2>
            <p className="text-sm text-text-secondary">Sign in to continue to SprintDesk.</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-text-muted">
            Demo credentials — username <span className="font-medium text-text-secondary">emilys</span>, password{' '}
            <span className="font-medium text-text-secondary">emilyspass</span>
          </p>
        </div>
      </div>
    </main>
  )
}
