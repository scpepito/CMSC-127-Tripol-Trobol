export function toStatusTone(status) {
  if (status === 'Valid') return 'success'
  if (status === 'Expired') return 'danger'
  if (status === 'Suspended') return 'warning'
  return 'neutral'
}

export function listRowFromApi(row) {
  return {
    id: row.registration_number,
    registrationNumber: row.registration_number,
    expirationDate: row.expiration_date,
    statusLabel: row.registration_status,
    statusTone: toStatusTone(row.registration_status),
    vehicleName: `${row.vehicle?.make} ${row.vehicle?.model} • ${row.vehicle?.year}`.trim(),
    vehicleSub: row.vehicle?.plate_number,
    ownerName: row.owner?.full_name ?? '',
    ownerLicenseNumber: row.owner?.license_number ?? '',
    _raw: vehicle_registration,
  }
}
