import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-semibold text-gray-900 text-lg">DropTask</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
          <Link href="/login" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Forward an email.<br />Get a task.
        </h1>
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          Every email you forward to your unique address lands on your board — with the sender, deadline, and attachments automatically extracted.
        </p>
        <Link href="/login" className="inline-block bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-medium hover:bg-gray-700 transition-colors">
          Start for free
        </Link>
        <p className="mt-4 text-sm text-gray-400">No credit card required</p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Get your address',
              body: 'Sign up and grab your unique email like abc123@mail.yourdomain.com.',
            },
            {
              step: '02',
              title: 'Forward anything',
              body: 'Forward any email to your address from any email client on any device.',
            },
            {
              step: '03',
              title: 'Task appears instantly',
              body: 'Subject becomes the title. Deadlines and priority are detected automatically.',
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="bg-gray-50 rounded-2xl p-6">
              <span className="text-xs font-mono text-gray-400 mb-3 block">{step}</span>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 py-16">
        <p className="text-center text-sm text-gray-400">
          Built for people who manage work through email
        </p>
      </section>
    </main>
  )
}
