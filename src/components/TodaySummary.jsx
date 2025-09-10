import { plan } from '../data/plan'
import { getWeekFromStart } from '../hooks/useDates'

export default function TodaySummary({ startDate, selectedDate }){
  const week = getWeekFromStart(new Date(startDate), new Date(selectedDate))
  const p = plan[week]
  return (
    <div className="bg-white shadow-md p-4 rounded-lg mt-4">
      <h2 className="text-lg font-bold">📅 {week}주차 — {p.phase}</h2>
      <p className="text-gray-600 mt-1">목표: {p.goal} · 칼로리: {p.kcal}</p>
      <div className="mt-3">
        <h3 className="font-semibold mb-1">🍽 식단</h3>
        <ul className="list-disc pl-5 text-sm">
          <li>아침: {p.meal.breakfast}</li>
          <li>점심: {p.meal.lunch}</li>
          <li>저녁: {p.meal.dinner}</li>
          <li>야식: {p.meal.snack}</li>
        </ul>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold mb-1">💪 운동</h3>
        <p className="text-sm">{p.workout}</p>
      </div>
      <p className="mt-3 text-emerald-600 font-semibold">예상 감량: {p.expected}</p>
    </div>
  )
}
