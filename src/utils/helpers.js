import { formatDistanceToNow, format } from 'date-fns'

export function timeAgo(date) {
  if (!date) return 'Never'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

export function formatDuration(ms) {
  if (!ms && ms !== 0) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
}

export function truncate(str, len = 40) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

export function generateId() {
  return 'node_' + Math.random().toString(36).substr(2, 9)
}

export function getStatusColor(status) {
  const map = {
    active: '#007AFF',
    running: '#34C759',
    completed: '#34C759',
    success: '#34C759',
    failed: '#FF3B30',
    error: '#FF3B30',
    pending: '#FFCC00',
    queued: '#FFCC00',
    paused: '#8E8E93',
    draft: '#8E8E93',
    disabled: '#8E8E93',
    cancelled: '#8E8E93',
    skipped: '#8E8E93',
  }
  return map[status] || '#8E8E93'
}

export function getStatusClass(status) {
  const map = {
    active: 'status-active',
    running: 'status-running',
    completed: 'status-completed',
    success: 'status-completed',
    failed: 'status-failed',
    error: 'status-failed',
    pending: 'status-pending',
    queued: 'status-pending',
    paused: 'status-paused',
    draft: 'status-paused',
    disabled: 'status-paused',
    cancelled: 'status-paused',
    skipped: 'status-paused',
  }
  return map[status] || 'status-paused'
}

export function stripAnsi(str) {
  if (typeof str !== 'string') return str
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
}
