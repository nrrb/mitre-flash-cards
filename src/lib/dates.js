const pad = (n) => String(n).padStart(2, '0')

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const today = () => toISO(new Date())

const parse = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (iso, n) => {
  const d = parse(iso)
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n))
}

// whole local days from a to b (b - a)
export const diffDays = (a, b) => {
  const x = parse(a)
  const y = parse(b)
  return Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) - Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / 86400000)
}
