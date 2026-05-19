export function formatNameWithMiddleInitial(name) {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length < 3) return parts.join(' ')

  const [first, middle, ...rest] = parts
  return [first, `${middle.charAt(0).toUpperCase()}.`, ...rest].join(' ')
}
