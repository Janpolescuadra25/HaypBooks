"use client"
import { Component, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export default class ModalErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(err: Error): State { return { error: err } }
  componentDidCatch(err: Error) { if (process.env.NODE_ENV !== 'production') console.error('[ModalErrorBoundary]', err) }
  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div role="alert" className="w-full max-w-md rounded-2xl border border-red-300 bg-white shadow-xl p-5 space-y-4">
            <h2 className="text-red-700 font-semibold text-lg">Invoice form crashed</h2>
            <p className="text-sm text-red-600 break-words">{this.state.error.message}</p>
            <div className="flex gap-2 justify-end">
              <button className="btn-secondary" onClick={()=> { this.setState({ error: null }) }}>Retry</button>
              <button className="btn-primary" onClick={()=> { window.location.reload() }}>Reload App</button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
