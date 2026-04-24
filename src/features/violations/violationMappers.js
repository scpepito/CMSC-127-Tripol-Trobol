export function toStatusTone(status) {
  if (status === 'Unpaid') return 'danger'
  if (status === 'Paid') return 'success'
  if (status === 'Contested') return 'warning'
  return 'neutral'
}

export function listRowFromApi(violation) {
  return {
    id: violation.violation_id,
    violationType: violation.violation_type,
    date: violation.date,
    location: violation.location,
    apprehendingOfficer: violation.apprehending_officer,
    violationFine: violation.violation_fine,
    statusLabel: violation.violation_status,
    statusTone: toStatusTone(violation.violation_status),
    vehicleName: `${violation.vehicle?.make} ${violation.vehicle?.model} • ${violation.vehicle?.year}`.trim(),
    vehicleSub: violation.vehicle?.plate_number,
    driverName: violation.driver?.full_name ?? '',
    driverLicenseNumber: violation.driver?.license_number ?? '',
    _raw: violation,
  }
}
