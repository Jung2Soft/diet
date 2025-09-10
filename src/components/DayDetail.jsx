import { useMemo, useState } from 'react'
import { plan } from '../data/plan'
import { formatDateKey, getWeekFromStart } from '../hooks/useDates'

export default function DayDetail({ startDate, date, weekIndex, checks, setChecks, weights, setWeights }){
  const week = weekIndex
  const p = plan[week]
  const key = formatDateKey(date)

  const dayChecks = checks[key] || { breakfast:false, lunch:false, dinner:false, snack:false, workout:false }
  const [local, setLocal] = useState(dayChecks)

  const save = () => {
    const updated = { ...checks, [key]: local }
    setChecks(updated)
  }

  const weight = weights[key] || ''
  const [w, setW] = useState(weight)

  const saveWeight = () => {
    const updated = { ...weights, [key]: w }
    setWeights(updated)
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-bold">📆 {key} 상세</h2>
      <p className="text-sm text-gray-500 mb-2">현재 주차: {week}주차 · {p.phase}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <h3 className="font-semibold mb-1">🍽 식단 체크</h3>
          {['breakfast','lunch','dinner','snack'].map((m)=>(
            <label key={m} className="flex items-center gap-2 text-sm py-1">
              <input type="checkbox" checked={local[m]} onChange={(e)=>setLocal({...local, [m]: e.target.checked})} />
              <span>{m==='breakfast'?'아침':m==='lunch'?'점심':m==='dinner'?'저녁':'야식'}</span>
            </label>
          ))}
          <h3 className="font-semibold mt-3 mb-1">💪 운동</h3>
          <label className="flex items-center gap-2 text-sm py-1">
            <input type="checkbox" checked={local.workout} onChange={(e)=>setLocal({...local, workout: e.target.checked})} />
            <span>오늘 운동 완료</span>
          </label>
          <button onClick={save} className="mt-2 px-3 py-1 bg-emerald-500 text-white rounded text-sm">저장</button>
        </div>

        <div>
          <h3 className="font-semibold mb-1">⚖️ 체중 기록 (kg)</h3>
          <div className="flex gap-2">
            <input value={w} onChange={(e)=>setW(e.target.value)} placeholder="예: 92.3" className="border rounded px-2 py-1 w-full" />
            <button onClick={saveWeight} className="px-3 py-1 bg-emerald-500 text-white rounded text-sm">저장</button>
          </div>
          <p className="text-xs text-gray-500 mt-1">그래프 탭에 반영됩니다.</p>
          <div className="mt-4">
            <h3 className="font-semibold mb-1">오늘의 가이드</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>아침: {p.meal.breakfast}</li>
              <li>점심: {p.meal.lunch}</li>
              <li>저녁: {p.meal.dinner}</li>
              <li>야식: {p.meal.snack}</li>
              <li>운동: {p.workout}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
