export function toStatusTone(status) {
  if (status === 'Active') return 'success'
  if (status === 'Expired') return 'danger'
  if (status === 'Suspended') return 'warning'
  return 'neutral'
}

export function listRowFromApi(registration) {
  return {
    id: registration.registration_number,
    registrationNumber: registration.registration_number,
    expirationDate: registration.expiration_date,
    statusLabel: registration.registration_status,
    statusTone: toStatusTone(registration.registration_status),
    vehicleName: `${registration.vehicle?.make} ${registration.vehicle?.model} • ${registration.vehicle?.year}`.trim(),
    vehicleSub: registration.vehicle?.plate_number,
    ownerName: registration.owner?.full_name ?? '',
    ownerLicenseNumber: registration.owner?.license_number ?? '',
    _raw: registration
  }
}
