import { apiFetch } from './http.js'

export async function listRegistrations({ search = '', type = '' } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  const qs = params.toString()
  const { data } = await apiFetch(`/registrations${qs ? `?${qs}` : ''}`)
  return data.registrations
}

export async function getRegistration(regNumber) {
  const { data } = await apiFetch(`/registrations/${encodeURIComponent(regNumber)}`)
  return data.registration
}

export async function createRegistration(payload) {
  const { data } = await apiFetch('/registrations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.registration
}

export async function updateRegistration(regNumber, payload) {
  const { data } = await apiFetch(`/registrations/${encodeURIComponent(regNumber)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return data.registration
}

export async function deleteRegistration(regNumber) {
  await apiFetch(`/registrations/${encodeURIComponent(regNumber)}`, { method: 'DELETE' })
}

