import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordStrengthIndicator } from '@/features/auth/PasswordStrengthIndicator'
import { useLoginMutation } from '@/hooks/useLoginMutation'
import { AuthApiError } from '@/services/auth/authApi'

interface FormErrors {
  username?: string
  password?: string
}

function validate(username: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!username.trim()) errors.username = 'Username is required.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < 4) errors.password = 'Password must be at least 4 characters.'
  return errors
}

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(username, password)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    loginMutation.mutate(
      { credentials: { username: username.trim(), password }, rememberMe },
      { onSuccess: () => navigate('/dashboard', { replace: true }) },
    )
  }

  const serverError =
    loginMutation.isError &&
    (loginMutation.error instanceof AuthApiError
      ? loginMutation.error.message
      : 'Unable to sign in. Check your connection and try again.')

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Username"
        required
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
        leftIcon={<User className="size-4" aria-hidden="true" />}
        placeholder="e.g. emilys"
      />
      <div>
        <Input
          label="Password"
          required
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          leftIcon={<Lock className="size-4" aria-hidden="true" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="rounded p-1 text-text-muted hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          }
        />
        <div className="mt-2">
          <PasswordStrengthIndicator password={password} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="size-4 rounded border-border accent-accent"
        />
        Remember me for 30 days
      </label>

      {serverError && (
        <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" isLoading={loginMutation.isPending} className="w-full">
        Sign in
      </Button>
    </form>
  )
}
