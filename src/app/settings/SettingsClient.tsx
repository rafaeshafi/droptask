'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const [emailAddress, setEmailAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const res = await fetch('/api/settings/token')
      if (res.ok) {
        const { email } = await res.json()
        setEmailAddress(email)
      }
      setLoading(false)
    }
    init()
  }, [supabase.auth, router])

  async function copy() {
    await navigator.clipboard.writeText(emailAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const domain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'mail.yourdomain.com'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Back to tasks</Link>
          <span className="font-semibold text-gray-900">DropTask</span>
          <div />
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">Your forwarding address</h2>
          <p className="text-sm text-gray-500 mb-4">
            Forward any email to this address and it will appear as a task on your board.
          </p>

          {loading ? (
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 truncate">
                {emailAddress}
              </code>
              <button
                onClick={copy}
                className="shrink-0 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">How to use it</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="font-mono text-gray-400 shrink-0">1.</span>
              <span>Copy your forwarding address above.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-gray-400 shrink-0">2.</span>
              <span>In Gmail, Outlook, or any email client — forward any email to that address.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-gray-400 shrink-0">3.</span>
              <span>The task appears on your board within seconds, with priority and deadline auto-detected.</span>
            </li>
          </ol>
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="font-semibold text-amber-800 mb-2">DNS setup required</h2>
          <p className="text-sm text-amber-700 mb-3">
            Add this MX record to your domain for emails to reach your board:
          </p>
          <div className="bg-white rounded-lg p-3 font-mono text-xs space-y-1 border border-amber-200">
            <div className="flex gap-4">
              <span className="text-gray-400 w-12">Type</span>
              <span className="text-gray-400 w-32">Name</span>
              <span className="text-gray-400 w-48">Value</span>
              <span className="text-gray-400">Priority</span>
            </div>
            <div className="flex gap-4 text-gray-800">
              <span className="w-12">MX</span>
              <span className="w-32">mail</span>
              <span className="w-48">inbound.postmarkapp.com</span>
              <span>10</span>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">
            This points <code>{domain}</code> to Postmark's inbound servers. Changes take up to 24h to propagate.
          </p>
        </section>
      </div>
    </div>
  )
}
