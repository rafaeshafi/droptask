'use client'

import { useState } from 'react'

interface Attachment {
  id: string
  filename: string
  content_type: string
  size: number
}

interface Task {
  id: string
  title: string
  description: string
  email_from: string
  email_from_name: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done'
  suggested_deadline: string | null
  deadline: string | null
  created_at: string
  attachments: Attachment[]
}

const PRIORITY_STYLES = {
  urgent: 'border-l-red-500 bg-red-50',
  high: 'border-l-orange-400 bg-orange-50',
  medium: 'border-l-blue-400 bg-white',
  low: 'border-l-gray-300 bg-white',
}

const PRIORITY_BADGE = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(iso: string) {
  return new Date(iso) < new Date()
}

interface Props {
  task: Task
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
}

export default function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const deadline = task.deadline || task.suggested_deadline
  const deadlineOverdue = deadline && isOverdue(deadline) && task.status !== 'done'

  async function handleDelete() {
    setDeleting(true)
    onDelete(task.id)
  }

  return (
    <div className={`border-l-4 rounded-r-xl rounded-bl-xl shadow-sm border border-gray-100 p-4 transition-all ${PRIORITY_STYLES[task.priority]} ${task.status === 'done' ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_BADGE[task.priority]}`}>
              {task.priority}
            </span>
            {task.suggested_deadline && !task.deadline && (
              <span className="text-xs text-gray-400 italic">deadline detected</span>
            )}
          </div>

          <button
            className="text-left w-full"
            onClick={() => setExpanded(!expanded)}
          >
            <h3 className={`font-medium text-gray-900 text-sm leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </h3>
          </button>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {task.email_from_name && (
              <span className="text-xs text-gray-500">
                from <span className="font-medium">{task.email_from_name}</span>
              </span>
            )}
            {deadline && (
              <span className={`text-xs font-medium ${deadlineOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                {deadlineOverdue ? '⚠ ' : ''}Due {formatDate(deadline)}
              </span>
            )}
            {task.attachments?.length > 0 && (
              <span className="text-xs text-gray-400">📎 {task.attachments.length}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {task.status !== 'done' && (
            <button
              onClick={() => onUpdate(task.id, { status: 'done' })}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 transition-colors"
              title="Mark done"
            >
              Done
            </button>
          )}
          {task.status === 'todo' && (
            <button
              onClick={() => onUpdate(task.id, { status: 'in_progress' })}
              className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg hover:bg-yellow-200 transition-colors"
              title="Mark in progress"
            >
              Start
            </button>
          )}
          {task.status === 'done' && (
            <button
              onClick={() => onUpdate(task.id, { status: 'todo' })}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reopen
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-300 hover:text-red-400 transition-colors p-1 text-sm"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>

      {expanded && task.description && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
            {task.description}
          </pre>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-300">
        {formatDate(task.created_at)}
      </div>
    </div>
  )
}
