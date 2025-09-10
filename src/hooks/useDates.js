export function toLocalISODate(d){
  const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const yyyy=x.getFullYear();const mm=String(x.getMonth()+1).padStart(2,'0');const dd=String(x.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}
export function parseLocalISO(str){const [y,m,d]=str.split('-').map(Number);return new Date(y,(m||1)-1,d||1)}
export function todayLocalISO(){return toLocalISODate(new Date())}
export function daysBetween(a,b){const da=new Date(a.getFullYear(),a.getMonth(),a.getDate());const db=new Date(b.getFullYear(),b.getMonth(),b.getDate());return Math.floor((db-da)/(1000*60*60*24))}
export function getWeekFromStart(start,current){const diffDays=daysBetween(start,current);const week=Math.floor(diffDays/7)+1;return Math.max(1,Math.min(24,week))}
export function formatDateKey(d){return toLocalISODate(d)}