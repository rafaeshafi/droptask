import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { extractDeadline, extractPriority, cleanEmailBody, extractTokenFromAddress } from '@/lib/email-parser'

interface PostmarkAttachment {
  Name: string
  Content: string
  ContentType: string
  ContentLength: number
}

interface PostmarkPayload {
  From: string
  FromName: string
  To: string
  Subject: string
  TextBody: string
  HtmlBody: string
  Date: string
  Attachments?: PostmarkAttachment[]
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.POSTMARK_WEBHOOK_SECRET
    if (secret) {
      const header = request.headers.get('x-postmark-signature') || ''
      if (header !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const payload: PostmarkPayload = await request.json()
    const { From, FromName, To, Subject, TextBody, HtmlBody, Attachments } = payload

    const token = extractTokenFromAddress(To)
    if (!token) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: tokenRow } = await supabase
      .from('email_tokens')
      .select('user_id')
      .eq('token', token)
      .single()

    if (!tokenRow) {
      return NextResponse.json({ error: 'Unknown token' }, { status: 404 })
    }

    const body = cleanEmailBody(TextBody || '', HtmlBody || '')
    const suggestedDeadline = extractDeadline(Subject || '', body)
    const priority = extractPriority(Subject || '', body)

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id: tokenRow.user_id,
        title: Subject || '(no subject)',
        description: body,
        email_from: From,
        email_from_name: FromName || From,
        email_subject: Subject,
        suggested_deadline: suggestedDeadline?.toISOString() ?? null,
        priority,
        status: 'todo',
      })
      .select()
      .single()

    if (taskError || !task) {
      console.error('Task insert error:', taskError)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    if (Attachments && Attachments.length > 0) {
      for (const att of Attachments) {
        try {
          const buffer = Buffer.from(att.Content, 'base64')
          const path = `${tokenRow.user_id}/${task.id}/${att.Name}`

          const { error: uploadError } = await supabase.storage
            .from('task-attachments')
            .upload(path, buffer, { contentType: att.ContentType })

          if (!uploadError) {
            await supabase.from('attachments').insert({
              task_id: task.id,
              filename: att.Name,
              storage_path: path,
              content_type: att.ContentType,
              size: att.ContentLength,
            })
          }
        } catch (e) {
          console.error('Attachment upload failed:', e)
        }
      }
    }

    return NextResponse.json({ success: true, task_id: task.id })
  } catch (e) {
    console.error('Email webhook error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
