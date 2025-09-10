import { useState } from 'react'

function getMonthGrid(dateStr){
  const dt = new Date(dateStr)
  const y = dt.getFullYear()
  const m = dt.getMonth()
  const first = new Date(y, m, 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(y, m+1, 0).getDate()

  const grid = []
  let day = 1 - startDay
  for(let r=0;r<6;r++){
    const row = []
    for(let c=0;c<7;c++){
      row.push(new Date(y, m, day))
      day++
    }
    grid.push(row)
  }
  return grid
}

export default function CalendarView({ selectedDate, onSelectDate }){
  const [view, setView] = useState(selectedDate)
  const grid = getMonthGrid(view)
  const s = new Date(selectedDate)

  const changeMonth = (delta)=>{
    const d = new Date(view)
    d.setMonth(d.getMonth()+delta)
    setView(d.toISOString().slice(0,10))
  }

  const isSameDay = (a,b)=> a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
  const inMonth = (cell)=> cell.getMonth()===new Date(view).getMonth()

  return (
    <div className="bg-white shadow rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <button className="px-2 py-1 bg-gray-100 rounded" onClick={()=>changeMonth(-1)}>〈</button>
        <div className="font-bold">{new Date(view).getFullYear()}년 {new Date(view).getMonth()+1}월</div>
        <button className="px-2 py-1 bg-gray-100 rounded" onClick={()=>changeMonth(1)}>〉</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {['일','월','화','수','목','금','토'].map((d)=>(<div key={d} className="py-1">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {grid.flat().map((d, i)=>{
          const isSel = isSameDay(d, s)
          return (
            <button
              key={i}
              onClick={()=>onSelectDate(d.toISOString().slice(0,10))}
              className={`py-2 rounded ${isSel ? 'bg-emerald-500 text-white' : inMonth(d)? 'bg-gray-50' : 'bg-gray-100 text-gray-400'}`}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
