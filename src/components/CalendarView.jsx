import { useState } from 'react'
import { toLocalISODate, parseLocalISO } from '../hooks/useDates'
function monthGrid(d){const y=d.getFullYear(),m=d.getMonth();const first=new Date(y,m,1);const startDay=first.getDay();const grid=[];let day=1-startDay;for(let r=0;r<6;r++){const row=[];for(let c=0;c<7;c++){row.push(new Date(y,m,day));day++}grid.push(row)}return grid}
export default function CalendarView({ selectedDate, onSelectDate }){
  const [view,setView]=useState(parseLocalISO(selectedDate));const grid=monthGrid(view);const sel=parseLocalISO(selectedDate);
  const changeMonth=(delta)=>{const d=new Date(view);d.setMonth(d.getMonth()+delta);setView(d)}
  const isSame=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  const inMonth=(c)=>c.getMonth()===view.getMonth();
  return (<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-3 transition">
    <div className="flex justify-between items-center mb-2">
      <button className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded" onClick={()=>changeMonth(-1)}>〈</button>
      <div className="font-bold">{view.getFullYear()}년 {view.getMonth()+1}월</div>
      <button className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded" onClick={()=>changeMonth(1)}>〉</button>
    </div>
    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-300">{['일','월','화','수','목','금','토'].map(d=>(<div key={d} className="py-1">{d}</div>))}</div>
    <div className="grid grid-cols-7 gap-1 text-center">
      {grid.flat().map((d,i)=>{const isSel=isSame(d,sel);return (<button key={i} onClick={()=>onSelectDate(toLocalISODate(d))} className={`py-2 rounded transition ${isSel?'bg-emerald-500 text-white':inMonth(d)?'bg-gray-50 dark:bg-gray-700 dark:text-gray-100':'bg-gray-100 dark:bg-gray-700/60 text-gray-400'}`}>{d.getDate()}</button>)})}
    </div>
  </div>)
}