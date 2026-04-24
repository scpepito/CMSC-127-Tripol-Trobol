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
    violationFine: violation.violation_type.fine,
    statusLabel: violation.violation_status,
    statusTone: toStatusTone(violation.violation_status),
    licenseNumber: violation.license_number,
    driver: violation.licenseNumber.driver,
    _raw: violation,
  }
}
