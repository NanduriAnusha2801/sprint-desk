import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CommentList } from '@/features/board/CommentList'
import { CommentForm } from '@/features/board/CommentForm'
import { useBoardStore } from '@/store/boardStore'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { resolveCurrentMockUser } from '@/lib/currentUser'
import { PRIORITY_LABELS, STATUS_LABELS, TASK_STATUSES, type Task, type TaskPriority, type TaskStatus, type User } from '@/types'

interface TaskDrawerProps {
  task: Task | undefined
  users: User[]
  usersById: Map<number, User>
  onClose: () => void
}

interface EditableFields {
  title: string
  description: string
  priority: TaskPriority
  assigneeId: string
  dueDate: string
}

function toFields(task: Task): EditableFields {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    assigneeId: String(task.assigneeId),
    dueDate: task.dueDate,
  }
}

export function TaskDrawer({ task, users, usersById, onClose }: TaskDrawerProps) {
  const [fields, setFields] = useState<EditableFields | null>(task ? toFields(task) : null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const updateTask = useBoardStore((s) => s.updateTask)
  const updateTaskStatus = useBoardStore((s) => s.updateTaskStatus)
  const deleteTask = useBoardStore((s) => s.deleteTask)
  const addComment = useBoardStore((s) => s.addComment)
  const allComments = useBoardStore((s) => s.comments)
  const comments = useMemo(
    () => (task ? allComments.filter((c) => c.taskId === task.id) : []),
    [allComments, task],
  )
  const authUser = useAuthStore((s) => s.user)
  const { toast } = useToast()

  useEffect(() => {
    setFields(task ? toFields(task) : null)
  }, [task])

  if (!task || !fields) return null

  const isDirty =
    fields.title !== task.title ||
    fields.description !== task.description ||
    fields.priority !== task.priority ||
    Number(fields.assigneeId) !== task.assigneeId ||
    fields.dueDate !== task.dueDate

  function handleSave() {
    if (!task || !fields) return
    if (!fields.title.trim()) {
      toast('Title cannot be empty.', 'error')
      return
    }
    updateTask(task.id, {
      title: fields.title.trim(),
      description: fields.description.trim(),
      priority: fields.priority,
      assigneeId: Number(fields.assigneeId),
      dueDate: fields.dueDate,
    })
    toast('Task updated.', 'success')
  }

  function handleStatusChange(status: TaskStatus) {
    if (!task) return
    updateTaskStatus(task.id, status)
    toast(`Task moved to ${STATUS_LABELS[status]}.`, 'success')
  }

  function handleAddComment(message: string) {
    if (!task) return
    const author = resolveCurrentMockUser(authUser, users)
    addComment(task.id, author?.id ?? users[0]?.id ?? 1, message)
  }

  function handleDelete() {
    if (!task) return
    deleteTask(task.id)
    toast('Task deleted.', 'success')
    setIsConfirmingDelete(false)
    onClose()
  }

  return (
    <>
      <Drawer isOpen={!!task} onClose={onClose} title="Task details">
        <div className="flex flex-col gap-5">
          <Input
            label="Title"
            required
            value={fields.title}
            onChange={(e) => setFields((f) => (f ? { ...f, title: e.target.value } : f))}
          />

          <Select
            label="Status"
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            options={TASK_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={fields.priority}
              onChange={(e) => setFields((f) => (f ? { ...f, priority: e.target.value as TaskPriority } : f))}
              options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
            />
            <Select
              label="Assignee"
              value={fields.assigneeId}
              onChange={(e) => setFields((f) => (f ? { ...f, assigneeId: e.target.value } : f))}
              options={users.map((u) => ({ value: String(u.id), label: u.name }))}
            />
          </div>

          <Input
            label="Due date"
            type="date"
            value={fields.dueDate}
            onChange={(e) => setFields((f) => (f ? { ...f, dueDate: e.target.value } : f))}
          />

          <Textarea
            label="Description"
            rows={4}
            value={fields.description}
            onChange={(e) => setFields((f) => (f ? { ...f, description: e.target.value } : f))}
          />

          <div className="flex justify-between gap-2">
            <Button variant="danger" size="sm" leftIcon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setIsConfirmingDelete(true)}>
              Delete task
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!isDirty}>
              Save changes
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Comments ({comments.length})</h3>
            <CommentList comments={comments} usersById={usersById} />
            <div className="mt-3">
              <CommentForm onSubmit={handleAddComment} />
            </div>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        onConfirm={handleDelete}
        title="Delete task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  )
}
