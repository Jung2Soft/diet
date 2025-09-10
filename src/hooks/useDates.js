export function daysBetween(a, b){
  const da = new Date(a); da.setHours(0,0,0,0)
  const db = new Date(b); db.setHours(0,0,0,0)
  const diff = (db - da) / (1000*60*60*24)
  return Math.floor(diff)
}

export function getWeekFromStart(start, current){
  const diffDays = daysBetween(start, current)
  const week = Math.floor(diffDays / 7) + 1
  return Math.max(1, Math.min(24, week))
}

export function formatDateKey(d){
  const x = new Date(d)
  const yyyy = x.getFullYear()
  const mm = String(x.getMonth()+1).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
