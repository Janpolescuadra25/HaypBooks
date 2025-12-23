import Link from 'next/link'

export default function ResourceGrid() {
  const items = [
    { title: 'Knowledge base', href: '/resources', desc: 'Step-by-step articles to troubleshoot and learn.' },
    { title: 'Community', href: '/community', desc: 'Ask questions and share tips with other users.' },
    { title: 'Contact Support', href: '/contact', desc: 'Email, chat, and phone support for account or technical help.' }
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {items.map((it) => (
        <div key={it.title} className="p-6 border rounded-lg bg-white">
          <h4 className="font-semibold mb-2">{it.title}</h4>
          <p className="text-slate-600 mb-4">{it.desc}</p>
          <Link href={it.href} className="text-emerald-600">{it.title} →</Link>
        </div>
      ))}
    </div>
  )
}
