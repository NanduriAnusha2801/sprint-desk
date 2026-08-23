import { useState, type FormEvent } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CommentFormProps {
  onSubmit: (message: string) => void
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [message, setMessage] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setMessage('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <label htmlFor="new-comment" className="sr-only">
        Add a comment
      </label>
      <textarea
        id="new-comment"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a comment…"
        rows={2}
        className="min-h-[38px] flex-1 resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />
      <Button type="submit" size="sm" disabled={!message.trim()} aria-label="Post comment">
        <SendHorizontal className="size-4" aria-hidden="true" />
      </Button>
    </form>
  )
}
