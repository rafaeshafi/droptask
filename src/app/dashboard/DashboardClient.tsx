'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TaskCard from '@/components/TaskCard'

type Status = 'all' | 'todo' | 'in_progress' | 'done'

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
  attachments: { id: string; filename: string; content_type: string; size: number }[]
}

const TABS: { value: Status; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks')
    if (res.ok) setTasks(await res.json())
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email ?? '')
      fetchTasks().finally(() => setLoading(false))
    })
  }, [supabase.auth, router, fetchTasks])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleUpdate(id: string, updates: Partial<Task>) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const updated = await res.json()
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t))
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) setTasks(prev => prev.filter(t => t.id !== id))
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">DropTask</Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
            <Link href="/settings" className="text-xs text-gray-600 hover:text-gray-900">Settings</Link>
            <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-gray-900">Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <Link href="/settings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Get your email address →
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-60">{counts[tab.value]}</span>
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">
              {filter === 'all'
                ? 'No tasks yet. Forward an email to create your first task.'
                : `No ${filter.replace('_', ' ')} tasks.`}
            </p>
            {filter === 'all' && (
              <Link href="/settings" className="text-blue-600 text-sm hover:underline">
                Get your forwarding address →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
