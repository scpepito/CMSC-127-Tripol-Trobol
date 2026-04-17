export function toStatusTone(status) {
  if (status === 'Valid') return 'success'
  if (status === 'Expired') return 'danger'
  if (status === 'Suspended') return 'warning'
  if (status === 'Revoked') return 'danger'
  return 'neutral'
}

export function listRowFromApi(driver) {
  return {
    id: driver.license_number,
    licenseNumber: driver.license_number,
    name: driver.full_name,
    licenseType: driver.license_type,
    statusLabel: driver.license_status,
    statusTone: toStatusTone(driver.license_status),
    expiration: driver.expiration_date,
    _raw: driver,
  }
}
