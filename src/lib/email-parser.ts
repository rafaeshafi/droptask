import * as chrono from 'chrono-node'

export function extractDeadline(subject: string, body: string): Date | null {
  const combined = `${subject}\n${body}`
  const results = chrono.parse(combined, new Date(), { forwardDate: true })
  if (results.length === 0) return null

  const date = results[0].start.date()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return date > oneDayAgo ? date : null
}

const URGENT = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'right away', 'as soon as possible']
const HIGH = ['important', 'deadline', 'high priority', 'by end of day', 'eod', 'eow', 'by tomorrow', 'overdue']
const LOW = ['when you can', 'no rush', 'fyi', 'whenever', 'no hurry', 'low priority', 'not urgent']

export function extractPriority(subject: string, body: string): 'low' | 'medium' | 'high' | 'urgent' {
  const text = `${subject} ${body}`.toLowerCase()
  if (URGENT.some(kw => text.includes(kw))) return 'urgent'
  if (HIGH.some(kw => text.includes(kw))) return 'high'
  if (LOW.some(kw => text.includes(kw))) return 'low'
  return 'medium'
}

export function cleanEmailBody(textBody: string, htmlBody: string): string {
  const raw = textBody || htmlBody.replace(/<[^>]*>/g, ' ')
  const footers = ['sent from my', 'get outlook', 'unsubscribe', 'this email was sent', '________________________________']
  const lines: string[] = []
  for (const line of raw.split('\n')) {
    if (line.trim().startsWith('>')) continue
    if (footers.some(f => line.toLowerCase().includes(f))) break
    lines.push(line)
  }
  return lines.join('\n').trim().replace(/\n{3,}/g, '\n\n')
}

export function extractTokenFromAddress(toAddress: string): string | null {
  const match = toAddress.match(/^([a-z0-9]+)@/i)
  return match ? match[1].toLowerCase() : null
}
