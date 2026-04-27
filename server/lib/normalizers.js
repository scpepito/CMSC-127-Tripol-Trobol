export function normalizeViolationStatus(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'unpaid') return 'Unpaid'
  if (v === 'paid') return 'Paid'
  if (v === 'contested') return 'Contested'
  return value.trim()
}

export function normalizeLicenseStatus(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'valid') return 'Valid'
  if (v === 'expired') return 'Expired'
  if (v === 'suspended') return 'Suspended'
  if (v === 'revoked') return 'Revoked'
  return value.trim()
}

export function normalizeRegistrationStatus(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'active') return 'Active'
  if (v === 'expired') return 'Expired'
  if (v === 'suspended') return 'Suspended'
  return value.trim()
}


export function normalizeVehicleType(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'private car') return 'Private Car'
  if (v === 'motorcycle') return 'Motorcycle'
  if (v === 'public utility vehicle' || v === 'puv') return 'Public Utility Vehicle'
  return value.trim()
}

export function normalizeLicenseType(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'professional') return 'Professional'
  if (v === 'non-professional' || v === 'non professional') return 'Non-Professional'
  if (v === 'student permit' || v === 'student-permit') return 'Student Permit'
  return value.trim()
}


export function normalizePlateNumber(value) {
  if (typeof value !== 'string') return value
  const cleaned = value.replace(/\s+/g, '').toUpperCase()
  if (/^[A-Z]{3}\d{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }
  return cleaned
}

export function normalizeLicenseNumber(value) {
  if (typeof value !== 'string') return value
  return value.replace(/-/g, '').trim().toUpperCase()
}

export function isoToday() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
