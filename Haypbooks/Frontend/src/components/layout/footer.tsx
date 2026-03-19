// App-wide footer (optional — omit from layouts if not needed)
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-400">
      © {new Date().getFullYear()} Haypbooks. All rights reserved.
    </footer>
  )
}
