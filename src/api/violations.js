import { apiFetch } from './http.js'

export async function listViolations({ search = '', status = '' } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  const qs = params.toString()
  const { data } = await apiFetch(`/violations${qs ? `?${qs}` : ''}`)
  return data.violations
}

export async function getViolation(violationId) {
  const { data } = await apiFetch(`/violations/${encodeURIComponent(violationId)}`)
  return data.violation
}

export async function createViolation(payload) {
  const { data } = await apiFetch('/violations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.violation
}

export async function updateViolation(violationId, payload) {
  const { data } = await apiFetch(`/violations/${encodeURIComponent(violationId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return data.violation
}

export async function deleteViolation(violationId) {
  await apiFetch(`/violations/${encodeURIComponent(violationId)}`, { method: 'DELETE' })
}

