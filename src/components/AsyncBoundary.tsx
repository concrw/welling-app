import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useMessages } from '../i18n'
import { retryChunkLoad } from '../lib/lazyWithReload'

export function BrandedLoading({ compact = false }: { compact?: boolean }) {
  const M = useMessages()
  return (
    <div style={{ minHeight: compact ? 80 : '100%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: compact ? 0 : 18 }}>
      {!compact && <img src="/uploads/welling-black.png" alt="WELLING" style={{ width: 112, height: 'auto' }} />}
      <div aria-label={M.common.loading} style={{ width: 24, height: 24, border: '3px solid #E8F3F1', borderTopColor: '#00A389', borderRadius: '50%', animation: 'welling-spin .8s linear infinite' }} />
      <style>{'@keyframes welling-spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}

interface BoundaryProps { children: ReactNode; message: string; retryLabel: string; compact?: boolean }
interface BoundaryState { failed: boolean }

class ChunkErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }
  static getDerivedStateFromError(): BoundaryState { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Failed to load application chunk', error, info.componentStack) }
  private retry = retryChunkLoad
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" style={{ minHeight: this.props.compact ? 80 : '100%', padding: 24, background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#555555', fontSize: 14 }}>{this.props.message}</p>
        <button onClick={this.retry} style={{ border: 0, borderRadius: 10, padding: '10px 18px', background: '#111111', color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{this.props.retryLabel}</button>
      </div>
    )
  }
}

export function AsyncErrorBoundary({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  const M = useMessages()
  return <ChunkErrorBoundary message={M.common.loadError} retryLabel={M.common.retry} compact={compact}>{children}</ChunkErrorBoundary>
}
