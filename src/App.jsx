import { useEffect, useMemo, useState } from 'react'
import CalendarView from './components/CalendarView'
import DayDetail from './components/DayDetail'
import ProgressChart from './components/ProgressChart'
import TodaySummary from './components/TodaySummary'
import { getWeekFromStart, formatDateKey } from './hooks/useDates'

export default function App() {
  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem('startDate') || new Date().toISOString().slice(0,10)
  })
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10))
  const [weights, setWeights] = useState(() => JSON.parse(localStorage.getItem('weights') || '{}'))
  const [checks, setChecks] = useState(() => JSON.parse(localStorage.getItem('checks') || '{}'))

  useEffect(() => localStorage.setItem('startDate', startDate), [startDate])
  useEffect(() => localStorage.setItem('weights', JSON.stringify(weights)), [weights])
  useEffect(() => localStorage.setItem('checks', JSON.stringify(checks)), [checks])

  const weekIndex = useMemo(() => getWeekFromStart(new Date(startDate), new Date(selectedDate)), [startDate, selectedDate])

  return (
    <div className="max-w-5xl mx-auto p-4">
      <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold">🏋️ 다이어트 캘린더</h1>
        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-600">시작일</label>
          <input
            type="date"
            value={startDate}
            onChange={(e)=>setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={()=>setSelectedDate(new Date().toISOString().slice(0,10))}
            className="px-3 py-1 rounded bg-emerald-500 text-white text-sm"
          >오늘</button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <TodaySummary startDate={startDate} selectedDate={selectedDate} />
        </div>
        <div>
          <DayDetail
            startDate={startDate}
            date={selectedDate}
            weekIndex={weekIndex}
            checks={checks}
            setChecks={setChecks}
            weights={weights}
            setWeights={setWeights}
          />
          <ProgressChart weights={weights} />
        </div>
      </div>
      <footer className="mt-8 text-center text-xs text-gray-400">
        오프라인 지원 PWA · 홈화면에 추가하여 앱처럼 사용하세요.
      </footer>
    </div>
  )
}
