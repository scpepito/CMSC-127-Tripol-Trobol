import { apiFetch } from './http.js'

export async function getReport(type, filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.set(key, String(value).trim())
    }
  })
  const qs = params.toString()
  const { data } = await apiFetch(`/reports/${encodeURIComponent(type)}${qs ? `?${qs}` : ''}`)
  return data.report
}
