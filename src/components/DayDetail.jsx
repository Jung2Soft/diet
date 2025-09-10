import { useEffect, useState } from 'react'
import { plan } from '../data/plan'
export default function DayDetail({ date, weekIndex, checks, setChecks, weights, setWeights }){
  const week=weekIndex;const p=plan[week];const key=date;
  const initial=checks[key]||{breakfast:false,lunch:false,dinner:false,snack:false,workout:false};const [local,setLocal]=useState(initial);
  useEffect(()=>{setLocal(checks[key]||{breakfast:false,lunch:false,dinner:false,snack:false,workout:false})},[key,checks]);
  useEffect(()=>{setChecks({...checks,[key]:local})},[local]); // auto-save
  const [w,setW]=useState(weights[key]||'');useEffect(()=>{setW(weights[key]||'')},[key,weights]);
  const onBlurWeight=()=>setWeights({...weights,[key]:w});
  const Item=({id,label})=>(<label className="flex items-center gap-2 text-sm py-1"><input type="checkbox" checked={!!local[id]} onChange={e=>setLocal(prev=>({...prev,[id]:e.target.checked}))}/><span>{label}</span></label>);
  return (<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 transition">
    <h2 className="text-lg font-bold">📆 {key} 상세</h2>
    <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">현재 주차: {week}주차 · {p.phase}</p>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <h3 className="font-semibold mb-1">🍽 식단 체크</h3>
        <Item id="breakfast" label="아침 완료"/><Item id="lunch" label="점심 완료"/><Item id="dinner" label="저녁 완료"/><Item id="snack" label="야식/간식 제한 준수"/>
        <h3 className="font-semibold mt-3 mb-1">💪 운동</h3><Item id="workout" label="오늘 운동 완료"/>
        <p className="text-xs text-gray-400 mt-2">체크는 자동 저장됩니다.</p>
      </div>
      <div>
        <h3 className="font-semibold mb-1">⚖️ 체중 기록 (kg)</h3>
        <div className="flex gap-2">
          <input value={w} onChange={e=>setW(e.target.value)} onBlur={onBlurWeight} placeholder="예: 92.3" className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600" inputMode="decimal"/>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">입력 후 포커스를 벗어나면 자동 저장됩니다.</p>
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
  </div>)
}