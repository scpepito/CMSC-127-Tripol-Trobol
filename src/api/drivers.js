import { apiFetch } from './http.js'

export async function listDrivers({ search = '', status = '', type = '' } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  if (type) params.set('type', type)
  const qs = params.toString()
  const { data } = await apiFetch(`/drivers${qs ? `?${qs}` : ''}`)
  return data.drivers
}

export async function getDriver(licenseNumber) {
  const { data } = await apiFetch(`/drivers/${encodeURIComponent(licenseNumber)}`)
  return data.driver
}

export async function createDriver(payload) {
  const { data } = await apiFetch('/drivers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.driver
}

export async function updateDriver(licenseNumber, payload) {
  const { data } = await apiFetch(`/drivers/${encodeURIComponent(licenseNumber)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return data.driver
}

export async function deleteDriver(licenseNumber) {
  await apiFetch(`/drivers/${encodeURIComponent(licenseNumber)}`, { method: 'DELETE' })
}

