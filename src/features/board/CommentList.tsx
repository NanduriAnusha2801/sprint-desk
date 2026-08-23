import { Avatar } from '@/components/ui/Avatar'
import { formatDateTime } from '@/lib/date'
import type { Comment, User } from '@/types'

interface CommentListProps {
  comments: Comment[]
  usersById: Map<number, User>
}

export function CommentList({ comments, usersById }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="py-2 text-sm text-text-muted">No comments yet.</p>
  }

  const sorted = [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((comment) => {
        const author = usersById.get(comment.authorId)
        return (
          <li key={comment.id} className="flex gap-2.5">
            <Avatar src={author?.avatar} name={author?.name ?? 'Unknown'} size="sm" />
            <div className="min-w-0 flex-1 rounded-md bg-surface-sunken px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">{author?.name ?? 'Unknown user'}</span>
                <span className="text-xs text-text-muted">{formatDateTime(comment.createdAt)}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-text-secondary">{comment.message}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
