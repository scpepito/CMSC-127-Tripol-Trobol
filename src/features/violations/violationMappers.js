export function toStatusTone(status) {
  if (status === 'Unpaid') return 'danger'
  if (status === 'Paid') return 'success'
  if (status === 'Contested') return 'warning'
  return 'neutral'
}
export function listRowFromApi(violation) {
  return {
    violationId: violation.violation_id,
    violationType: violation.violation_type,
    date: violation.violation_date, 
    apprehendingOfficer: violation.apprehending_officer,
    violationFine: violation.violation_fine,
    statusLabel: violation.violation_status,
    statusTone: toStatusTone(violation.violation_status),
    
    vehicleName: violation.plate_number, 
    vehicleSub: '', 
    
    driverName: violation.driver_name ?? '',
    driverLicenseNumber: violation.license_number ?? '', 
    
    _raw: violation,
  }
}