import { apiFetch } from './http.js'

export async function listVehicles({ search = '', type = '' } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (type) params.set('type', type)
  const qs = params.toString()
  const { data } = await apiFetch(`/vehicles${qs ? `?${qs}` : ''}`)
  return data.vehicles
}

export async function getVehicle(plateNumber) {
  const { data } = await apiFetch(`/vehicles/${encodeURIComponent(plateNumber)}`)
  return data.vehicle
}

export async function createVehicle(payload) {
  const { data } = await apiFetch('/vehicles', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.vehicle
}

export async function updateVehicle(plateNumber, payload) {
  const { data } = await apiFetch(`/vehicles/${encodeURIComponent(plateNumber)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return data.vehicle
}

export async function deleteVehicle(plateNumber) {
  await apiFetch(`/vehicles/${encodeURIComponent(plateNumber)}`, { method: 'DELETE' })
}

