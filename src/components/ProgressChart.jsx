import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
export default function ProgressChart({ weights }){
  const entries=Object.entries(weights).sort((a,b)=>a[0].localeCompare(b[0]))
  const labels=entries.map(e=>e[0])
  const dataVals=entries.map(e=>parseFloat(e[1]||0))
  const data={labels,datasets:[{label:'체중(kg)',data:dataVals,borderColor:'rgb(16,185,129)',tension:.25}]};
  const opts={plugins:{legend:{display:false}},scales:{x:{ticks:{maxRotation:0,autoSkip:true}}}};
  return (<div className="bg-white dark:bg-gray-800 shadow p-4 rounded-lg mt-4">
    <h2 className="text-lg font-bold mb-2">체중 변화 그래프</h2>
    {labels.length?<Line data={data} options={opts}/>:<p className="text-sm text-gray-500 dark:text-gray-300">아직 기록이 없어요. 오늘 체중을 입력해보세요.</p>}
  </div>)
}