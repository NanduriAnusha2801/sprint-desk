import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useBoardStore } from '@/store/boardStore'
import { useToast } from '@/hooks/useToast'
import { minSelectableDate, isFutureDate } from '@/lib/date'
import { PRIORITY_LABELS, type TaskPriority, type TaskStatus, type User, type Sprint } from '@/types'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  defaultStatus: TaskStatus
  users: User[]
  currentSprint: Sprint | undefined
}

interface FormState {
  title: string
  description: string
  priority: TaskPriority
  assigneeId: string
  dueDate: string
}

const INITIAL_STATE: FormState = { title: '', description: '', priority: 'medium', assigneeId: '', dueDate: '' }

interface FormErrors {
  title?: string
  assigneeId?: string
  dueDate?: string
}

export function CreateTaskModal({ isOpen, onClose, defaultStatus, users, currentSprint }: CreateTaskModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<FormErrors>({})
  const addTask = useBoardStore((s) => s.addTask)
  const { toast } = useToast()

  function handleClose() {
    setForm(INITIAL_STATE)
    setErrors({})
    onClose()
  }

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.assigneeId) next.assigneeId = 'Select an assignee.'
    if (!form.dueDate) next.dueDate = 'Due date is required.'
    else if (!isFutureDate(form.dueDate)) next.dueDate = 'Due date must be after today.'
    return next
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    addTask({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      assigneeId: Number(form.assigneeId),
      dueDate: form.dueDate,
      sprintId: currentSprint?.id ?? 1,
      status: defaultStatus,
    })
    toast('Task created successfully.', 'success')
    handleClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create task"
      description="Add a new task to the sprint board."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-task-form">
            Create task
          </Button>
        </>
      }
    >
      <form id="create-task-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Title"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={errors.title}
          placeholder="e.g. Fix pagination bug"
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Optional details"
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            required
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
            options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <Select
            label="Assignee"
            required
            placeholder="Select assignee"
            value={form.assigneeId}
            onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
            error={errors.assigneeId}
            options={users.map((u) => ({ value: String(u.id), label: u.name }))}
          />
        </div>
        <Input
          label="Due date"
          type="date"
          required
          min={minSelectableDate()}
          value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          error={errors.dueDate}
          hint="Must be a date after today."
        />
      </form>
    </Modal>
  )
}
