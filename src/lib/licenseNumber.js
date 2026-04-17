export function toLicenseRaw(value) {
  return String(value ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 11)
}

export function formatLicenseNumber(value) {
  const raw = toLicenseRaw(value)
  const a = raw.slice(0, 3)
  const b = raw.slice(3, 5)
  const c = raw.slice(5)
  if (raw.length <= 3) return a
  if (raw.length <= 5) return `${a}-${b}`
  return `${a}-${b}-${c}`
}

