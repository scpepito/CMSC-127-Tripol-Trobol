const DEFAULT_BASE_URL = 'http://localhost:3001'

export function getApiBaseUrl() {
  const fromEnv = import.meta?.env?.VITE_API_BASE_URL
  return typeof fromEnv === 'string' && fromEnv.trim() ? fromEnv.trim() : DEFAULT_BASE_URL
}

export async function apiFetch(path, options) {
  const url = `${getApiBaseUrl()}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  if (res.status === 204) return { ok: true, data: null }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status}): ${res.statusText}`
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }

  return { ok: true, data }
}

