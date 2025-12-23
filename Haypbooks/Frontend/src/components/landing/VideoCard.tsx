import Link from 'next/link'

export default function VideoCard({ title, desc, href }: { title: string; desc: string; href?: string }) {
  return (
    <div className="rounded-lg border p-4 bg-white">
      <div className="aspect-video bg-slate-100 rounded-md mb-4 flex items-center justify-center">{href ? <a href={href} className="text-slate-500">Watch video</a> : 'Video placeholder'}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  )
}
