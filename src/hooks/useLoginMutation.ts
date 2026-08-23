import { useMutation } from '@tanstack/react-query'
import { signIn } from '@/services/auth/sessionService'
import type { LoginRequest } from '@/types/auth'

interface LoginVariables {
  credentials: LoginRequest
  rememberMe: boolean
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ credentials, rememberMe }: LoginVariables) => signIn(credentials, rememberMe),
  })
}
