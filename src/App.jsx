import { useEffect, useMemo, useState } from 'react'
import CalendarView from './components/CalendarView'
import DayDetail from './components/DayDetail'
import ProgressChart from './components/ProgressChart'
import TodaySummary from './components/TodaySummary'
import { getWeekFromStart, parseLocalISO, todayLocalISO } from './hooks/useDates'

export default function App(){
  const [dark,setDark]=useState(()=>localStorage.getItem('dark')==='1')
  useEffect(()=>{document.documentElement.classList.toggle('dark',dark);localStorage.setItem('dark',dark?'1':'0')},[dark])

  const [startDate,setStartDate]=useState(()=>localStorage.getItem('startDate')||todayLocalISO())
  const [selectedDate,setSelectedDate]=useState(()=>todayLocalISO())
  const [weights,setWeights]=useState(()=>JSON.parse(localStorage.getItem('weights')||'{}'))
  const [checks,setChecks]=useState(()=>JSON.parse(localStorage.getItem('checks')||'{}'))
  useEffect(()=>localStorage.setItem('startDate',startDate),[startDate])
  useEffect(()=>localStorage.setItem('weights',JSON.stringify(weights)),[weights])
  useEffect(()=>localStorage.setItem('checks',JSON.stringify(checks)),[checks])
  const weekIndex=useMemo(()=>getWeekFromStart(parseLocalISO(startDate),parseLocalISO(selectedDate)),[startDate,selectedDate])

  return (<div className="max-w-5xl mx-auto p-4 transition-colors duration-300 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen">
    <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur z-10 p-2 rounded">
      <h1 className="text-2xl sm:text-3xl font-extrabold">🏋️ 다이어트 캘린더</h1>
      <div className="flex gap-3 items-center">
        <label className="text-sm text-gray-600 dark:text-gray-300">시작일</label>
        <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"/>
        <button onClick={()=>setSelectedDate(todayLocalISO())} className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-sm transition">오늘</button>
        <button onClick={()=>setDark(v=>!v)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 dark:text-gray-100 text-sm transition" aria-label="다크모드 토글">{dark?'라이트':'다크'}</button>
      </div>
    </header>
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate}/>
        <TodaySummary startDate={startDate} selectedDate={selectedDate}/>
      </div>
      <div>
        <DayDetail startDate={startDate} date={selectedDate} weekIndex={weekIndex} checks={checks} setChecks={setChecks} weights={weights} setWeights={setWeights}/>
        <ProgressChart weights={weights}/>
      </div>
    </div>
    <footer className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">오프라인 지원 PWA · 홈화면에 추가하여 앱처럼 사용하세요.</footer>
  </div>)
}