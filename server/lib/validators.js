export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function toTrimmed(value) {
  return typeof value === 'string' ? value.trim() : value
}

export function badRequest(res, message, details) {
  return res.status(400).json({ error: message, details })
}

